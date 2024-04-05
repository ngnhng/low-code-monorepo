package common

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common/header"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/common/middleware"
	"gitlab.com/shar-workflow/shar/common/subj"
	"gitlab.com/shar-workflow/shar/common/workflow"
	errors2 "gitlab.com/shar-workflow/shar/server/errors"
	"gitlab.com/shar-workflow/shar/server/messages"
	"google.golang.org/protobuf/proto"
	"log/slog"
	"math/big"
	"reflect"
	"strconv"
	"strings"
	"time"
)

// NatsConn is the trimmad down NATS Connection interface that only emcompasses the methods used by SHAR
type NatsConn interface {
	JetStream(opts ...nats.JSOpt) (nats.JetStreamContext, error)
	QueueSubscribe(subj string, queue string, cb nats.MsgHandler) (*nats.Subscription, error)
	Publish(subj string, bytes []byte) error
	PublishMsg(msg *nats.Msg) error
}

func updateKV(wf nats.KeyValue, k string, msg proto.Message, updateFn func(v []byte, msg proto.Message) ([]byte, error)) error {
	const JSErrCodeStreamWrongLastSequence = 10071
	for {
		entry, err := wf.Get(k)
		if err != nil {
			return fmt.Errorf("get value to update: %w", err)
		}
		rev := entry.Revision()
		uv, err := updateFn(entry.Value(), msg)
		if err != nil {
			return fmt.Errorf("update function: %w", err)
		}
		_, err = wf.Update(k, uv, rev)

		if err != nil {
			maxJitter := &big.Int{}
			maxJitter.SetInt64(5000)
			testErr := &nats.APIError{}
			if errors.As(err, &testErr) {
				if testErr.ErrorCode == JSErrCodeStreamWrongLastSequence {
					dur, err := rand.Int(rand.Reader, maxJitter) // Jitter
					if err != nil {
						panic("read random")
					}
					time.Sleep(time.Duration(dur.Int64()))
					continue
				}
			}
			return fmt.Errorf("update kv: %w", err)
		}
		break
	}
	return nil
}

// Save saves a value to a key value store
func Save(ctx context.Context, wf nats.KeyValue, k string, v []byte) error {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.VerboseLevel) {
		log.Log(ctx, errors2.VerboseLevel, "Set KV", slog.String("bucket", wf.Bucket()), slog.String("key", k), slog.String("val", string(v)))
	}
	if _, err := wf.Put(k, v); err != nil {
		return fmt.Errorf("save kv: %w", err)
	}
	return nil
}

// Load loads a value from a key value store
func Load(ctx context.Context, wf nats.KeyValue, k string) ([]byte, error) {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.VerboseLevel) {
		log.Log(ctx, errors2.VerboseLevel, "Get KV", slog.Any("bucket", wf.Bucket()), slog.String("key", k))
	}
	b, err := wf.Get(k)
	if err == nil {
		return b.Value(), nil
	}
	return nil, fmt.Errorf("load value from KV: %w", err)
}

// SaveObj save an protobuf message to a key value store
func SaveObj(ctx context.Context, wf nats.KeyValue, k string, v proto.Message) error {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.TraceLevel) {
		log.Log(ctx, errors2.TraceLevel, "save KV object", slog.String("bucket", wf.Bucket()), slog.String("key", k), slog.Any("val", v))
	}
	b, err := proto.Marshal(v)
	if err == nil {
		return Save(ctx, wf, k, b)
	}
	return fmt.Errorf("save object into KV: %w", err)
}

// LoadObj loads a protobuf message from a key value store
func LoadObj(ctx context.Context, wf nats.KeyValue, k string, v proto.Message) error {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.TraceLevel) {
		log.Log(ctx, errors2.TraceLevel, "load KV object", slog.String("bucket", wf.Bucket()), slog.String("key", k), slog.Any("val", v))
	}
	kv, err := Load(ctx, wf, k)
	if err != nil {
		return fmt.Errorf("load object from KV %s(%s): %w", wf.Bucket(), k, err)
	}
	if err := proto.Unmarshal(kv, v); err != nil {
		return fmt.Errorf("unmarshal in LoadObj: %w", err)
	}
	return nil
}

// UpdateObj saves an protobuf message to a key value store after using updateFN to update the message.
func UpdateObj[T proto.Message](ctx context.Context, wf nats.KeyValue, k string, msg T, updateFn func(v T) (T, error)) error {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.TraceLevel) {
		log.Log(ctx, errors2.TraceLevel, "update KV object", slog.String("bucket", wf.Bucket()), slog.String("key", k), slog.Any("fn", reflect.TypeOf(updateFn)))
	}
	if oldk, err := wf.Get(k); errors.Is(err, nats.ErrKeyNotFound) || (err == nil && oldk.Value() == nil) {
		if err := SaveObj(ctx, wf, k, msg); err != nil {
			return fmt.Errorf("save during update object: %w", err)
		}
	}
	return updateKV(wf, k, msg, func(bv []byte, msg proto.Message) ([]byte, error) {
		if err := proto.Unmarshal(bv, msg); err != nil {
			return nil, fmt.Errorf("unmarshal proto for KV update: %w", err)
		}
		uv, err := updateFn(msg.(T))
		if err != nil {
			return nil, fmt.Errorf("update function: %w", err)
		}
		b, err := proto.Marshal(uv)
		if err != nil {
			return nil, fmt.Errorf("marshal updated proto: %w", err)
		}
		return b, nil
	})
}

// UpdateObjIsNew saves an protobuf message to a key value store after using updateFN to update the message, and returns true if this is a new value.
func UpdateObjIsNew[T proto.Message](ctx context.Context, wf nats.KeyValue, k string, msg T, updateFn func(v T) (T, error)) (bool, error) {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.TraceLevel) {
		log.Log(ctx, errors2.TraceLevel, "update KV object", slog.String("bucket", wf.Bucket()), slog.String("key", k), slog.Any("fn", reflect.TypeOf(updateFn)))
	}
	isNew := false
	if oldk, err := wf.Get(k); errors.Is(err, nats.ErrKeyNotFound) || (err == nil && oldk.Value() == nil) {
		if err := SaveObj(ctx, wf, k, msg); err != nil {
			return false, fmt.Errorf("save during update object: %w", err)
		}
		isNew = true
	}

	if err := updateKV(wf, k, msg, func(bv []byte, msg proto.Message) ([]byte, error) {
		if err := proto.Unmarshal(bv, msg); err != nil {
			return nil, fmt.Errorf("unmarshal proto for KV update: %w", err)
		}
		uv, err := updateFn(msg.(T))
		if err != nil {
			return nil, fmt.Errorf("update function: %w", err)
		}
		b, err := proto.Marshal(uv)
		if err != nil {
			return nil, fmt.Errorf("marshal updated proto: %w", err)
		}
		return b, nil
	}); err != nil {
		return false, fmt.Errorf("update obj is new failed: %w", err)
	}
	return isNew, nil
}

// Delete deletes an item from a key value store.
func Delete(kv nats.KeyValue, key string) error {
	if err := kv.Delete(key); err != nil {
		return fmt.Errorf("delete key: %w", err)
	}
	return nil
}

// EnsureBuckets ensures that a list of key value stores exist
func EnsureBuckets(js nats.JetStreamContext, storageType nats.StorageType, names []string) error {
	for _, i := range names {
		var ttl time.Duration
		if i == messages.KvLock {
			ttl = time.Second * 30
		}
		if i == messages.KvClients {
			ttl = time.Millisecond * 1500
		}
		if err := EnsureBucket(js, storageType, i, ttl); err != nil {
			return fmt.Errorf("ensure bucket: %w", err)
		}
	}
	return nil
}

// EnsureBucket creates a bucket if it does not exist
func EnsureBucket(js nats.JetStreamContext, storageType nats.StorageType, name string, ttl time.Duration) error {
	if _, err := js.KeyValue(name); errors.Is(err, nats.ErrBucketNotFound) {
		if _, err := js.CreateKeyValue(&nats.KeyValueConfig{
			Bucket:  name,
			Storage: storageType,
			TTL:     ttl,
		}); err != nil {
			return fmt.Errorf("ensure buckets: %w", err)
		}
	} else if err != nil {
		return fmt.Errorf("obtain bucket: %w", err)
	}
	return nil
}

// Process processes messages from a nats consumer and executes a function against each one.
func Process(ctx context.Context, js nats.JetStreamContext, streamName string, traceName string, closer chan struct{}, subject string, durable string, concurrency int, middleware []middleware.Receive, fn func(ctx context.Context, log *slog.Logger, msg *nats.Msg) (bool, error), opts ...ProcessOption) error {
	set := &ProcessOpts{}
	for _, i := range opts {
		i.Set(set)
	}
	log := logx.FromContext(ctx)

	if durable != "" {
		if !strings.HasPrefix(durable, "ServiceTask_") {
			conInfo, err := js.ConsumerInfo(streamName, durable)
			if err != nil || conInfo.Config.Durable == "" {
				return fmt.Errorf("durable consumer '%s' is not explicity configured", durable)
			}
		}
	}
	sub, err := js.PullSubscribe(subject, durable, nats.BindStream(streamName))
	if err != nil {
		log.Error("process pull subscribe error", err, "subject", subject, "durable", durable)
		return fmt.Errorf("process pull subscribe error subject:%s durable:%s: %w", subject, durable, err)
	}
	for i := 0; i < concurrency; i++ {
		go func() {
			for {
				select {
				case <-closer:
					return
				default:
				}
				reqCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
				msg, err := sub.Fetch(1, nats.Context(reqCtx))
				if err != nil {
					if errors.Is(err, context.DeadlineExceeded) {
						cancel()
						continue
					}
					// Horrible, but this isn't a typed error.  This test just stops the listener printing pointless errors.
					if err.Error() == "nats: Server Shutdown" || err.Error() == "nats: connection closed" {
						cancel()
						continue
					}
					// Log Error
					log.Error("message fetch error", err)
					cancel()
					continue
				}
				m := msg[0]
				ctx, err := header.FromMsgHeaderToCtx(ctx, m.Header)
				if x := msg[0].Header.Get(header.SharNamespace); x == "" {
					log.Error("message without namespace", slog.Any("subject", m.Subject))
					if err := msg[0].Ack(); err != nil {
						log.Error("processing failed to ack", err)
					}
					cancel()
					continue
				}
				if err != nil {
					log.Error("get header values from incoming process message", slog.Any("error", &errors2.ErrWorkflowFatal{Err: err}))
					if err := msg[0].Ack(); err != nil {
						log.Error("processing failed to ack", err)
					}
					cancel()
					continue
				}
				//				log.Debug("Process:"+traceName, slog.String("subject", msg[0].Subject))
				cancel()
				if embargo := m.Header.Get("embargo"); embargo != "" && embargo != "0" {
					e, err := strconv.Atoi(embargo)
					if err != nil {
						log.Error("bad embargo value", err)
						cancel()
						continue
					}
					offset := time.Duration(int64(e) - time.Now().UnixNano())
					if offset > 0 {
						if err := m.NakWithDelay(offset); err != nil {
							log.Warn("nak with delay")
						}
						cancel()
						continue
					}
				}

				executeCtx, executeLog := logx.NatsMessageLoggingEntrypoint(context.Background(), "server", m.Header)
				executeCtx = header.Copy(ctx, executeCtx)
				executeCtx = subj.SetNS(executeCtx, m.Header.Get(header.SharNamespace))

				for _, i := range middleware {
					var err error
					if executeCtx, err = i(executeCtx, m); err != nil {
						slog.Error("process middleware", "error", err, "subject", subject, "middleware", reflect.TypeOf(i).Name())
						continue
					}
				}

				ack, err := fn(executeCtx, executeLog, msg[0])
				if err != nil {
					if errors2.IsWorkflowFatal(err) {
						executeLog.Error("workflow fatal error occured processing function", err)
						ack = true
					} else {
						wfe := &workflow.Error{}
						if !errors.As(err, wfe) {
							if set.BackoffCalc != nil {
								executeLog.Error("processing error", err, "name", traceName)
								err := set.BackoffCalc(executeCtx, msg[0])
								if err != nil {
									slog.Error("backoff error", "error", err)
								}
								cancel()
								continue
							}
						}
					}
				}
				if ack {
					if err := msg[0].Ack(); err != nil {
						log.Error("processing failed to ack", err)
					}
				} else {
					if err := msg[0].Nak(); err != nil {
						log.Error("processing failed to nak", err)
					}
				}
			}
		}()
	}
	return nil
}

const jsErrCodeStreamWrongLastSequence = 10071

var lockVal = make([]byte, 0)

// Lock ensures a lock on a given ID, it returns true if a lock was granted.
func Lock(kv nats.KeyValue, lockID string) (bool, error) {
	_, err := kv.Create(lockID, lockVal)
	if errors.Is(err, nats.ErrKeyExists) {
		return false, nil
	} else if err != nil {
		return false, fmt.Errorf("querying lock: %w", err)
	}
	return true, nil
}

// ExtendLock extends the lock past its stale time.
func ExtendLock(kv nats.KeyValue, lockID string) error {
	v, err := kv.Get(lockID)
	if errors.Is(err, nats.ErrKeyNotFound) {
		return fmt.Errorf("hold lock found no lock: %w", err)
	} else if err != nil {
		return fmt.Errorf("querying lock: %w", err)
	}
	rev := v.Revision()
	_, err = kv.Update(lockID, lockVal, rev)
	testErr := &nats.APIError{}
	if errors.As(err, &testErr) {
		if testErr.ErrorCode == jsErrCodeStreamWrongLastSequence {
			return nil
		}
	} else if err != nil {
		return fmt.Errorf("extend lock: %w", err)
	}
	return nil
}

// UnLock closes an existing lock.
func UnLock(kv nats.KeyValue, lockID string) error {
	_, err := kv.Get(lockID)
	if errors.Is(err, nats.ErrKeyNotFound) {
		return fmt.Errorf("unlocking found no lock: %w", err)
	} else if err != nil {
		return fmt.Errorf("unlocking get lock: %w", err)
	}
	if err := kv.Delete(lockID); err != nil {
		return fmt.Errorf("unlocking: %w", err)
	}
	return nil
}

func largeObjLock(ctx context.Context, lockKV nats.KeyValue, key string) error {
	for {
		cErr := ctx.Err()
		if cErr != nil {
			if errors.Is(cErr, context.DeadlineExceeded) {
				return fmt.Errorf("load large timeout: %w", cErr)
			} else if errors.Is(cErr, context.Canceled) {
				return fmt.Errorf("load large cancelled: %w", cErr)
			} else {
				return fmt.Errorf("load large: %w", cErr)
			}
		}

		lock, err := Lock(lockKV, key)
		if err != nil {
			return fmt.Errorf("load large locking: %w", err)
		}
		if !lock {
			time.Sleep(500 * time.Millisecond)
			continue
		}
		break
	}
	return nil
}

// LoadLarge load a large binary from the object store
func LoadLarge(ctx context.Context, ds nats.ObjectStore, mutex nats.KeyValue, key string, opt ...nats.GetObjectOpt) ([]byte, error) {
	if err := largeObjLock(ctx, mutex, key); err != nil {
		return nil, fmt.Errorf("load large locking: %w", err)
	}
	defer func() {
		if err := UnLock(mutex, key); err != nil {
			slog.Error("load large unlocking", "error", err.Error())
		}
	}()
	ret, err := ds.GetBytes(key, opt...)
	if err != nil {
		return nil, fmt.Errorf("load large get: %w", err)
	}
	return ret, nil
}

// SaveLarge saves a large binary from the object store
func SaveLarge(ctx context.Context, ds nats.ObjectStore, mutex nats.KeyValue, key string, data []byte, opt ...nats.ObjectOpt) error {
	opt = append(opt, nats.Context(ctx))
	if err := largeObjLock(ctx, mutex, key); err != nil {
		return fmt.Errorf("save large locking: %w", err)
	}
	defer func() {
		if err := UnLock(mutex, key); err != nil {
			slog.Error("save large unlocking", "error", err.Error())
		}
	}()
	if _, err := ds.PutBytes(key, data, opt...); err != nil {

		return fmt.Errorf("save large put: %w", err)
	}
	return nil
}

// SaveLargeObj save an protobuf message to a document store
func SaveLargeObj(ctx context.Context, ds nats.ObjectStore, mutex nats.KeyValue, k string, v proto.Message, opt ...nats.ObjectOpt) error {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.TraceLevel) {
		log.Log(ctx, errors2.TraceLevel, "save object", slog.String("key", k), slog.Any("val", v))
	}
	b, err := proto.Marshal(v)
	if err == nil {
		return SaveLarge(ctx, ds, mutex, k, b, opt...)
	}
	return fmt.Errorf("save object into KV: %w", err)
}

// LoadLargeObj loads a protobuf message from a key value store
func LoadLargeObj(ctx context.Context, ds nats.ObjectStore, mutex nats.KeyValue, k string, v proto.Message, opt ...nats.GetObjectOpt) error {
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.TraceLevel) {
		log.Log(ctx, errors2.TraceLevel, "load object", slog.String("key", k), slog.Any("val", v))
	}
	doc, err := LoadLarge(ctx, ds, mutex, k, opt...)
	if err != nil {
		return fmt.Errorf("load object %s: %w", k, err)
	}
	if err := proto.Unmarshal(doc, v); err != nil {
		return fmt.Errorf("load large object unmarshal: %w", err)
	}
	return nil
}

// UpdateLargeObj saves an protobuf message to a document store after using updateFN to update the message.
func UpdateLargeObj[T proto.Message](ctx context.Context, ds nats.ObjectStore, mutex nats.KeyValue, k string, msg T, updateFn func(v T) (T, error)) (T, error) { //nolint
	log := logx.FromContext(ctx)
	if log.Enabled(ctx, errors2.TraceLevel) {
		log.Log(ctx, errors2.TraceLevel, "update object", slog.String("key", k), slog.Any("fn", reflect.TypeOf(updateFn)))
	}

	if err := LoadLargeObj(ctx, ds, mutex, k, msg); err != nil {
		return msg, fmt.Errorf("update large object load: %w", err)
	}
	nw, err := updateFn(msg)
	if err != nil {
		return msg, fmt.Errorf("update large object updateFn: %w", err)
	}
	if err := SaveLargeObj(ctx, ds, mutex, k, msg); err != nil {
		return msg, fmt.Errorf("update large object save: %w", err)
	}
	return nw, nil
}

// DeleteLarge deletes a large binary from the object store
func DeleteLarge(ctx context.Context, ds nats.ObjectStore, mutex nats.KeyValue, k string) error {
	if err := largeObjLock(ctx, mutex, k); err != nil {
		return fmt.Errorf("delete large locking: %w", err)
	}
	defer func() {
		if err := UnLock(mutex, k); err != nil {
			slog.Error("load large unlocking", "error", err.Error())
		}
	}()
	if err := ds.Delete(k); err != nil && errors.Is(err, nats.ErrNoObjectsFound) && !errors.Is(err, nats.ErrKeyNotFound) {
		return fmt.Errorf("delete large removing: %w", err)
	}
	return nil
}

// PublishOnce sets up a single message to be used as a timer.
func PublishOnce(js nats.JetStreamContext, lockingKV nats.KeyValue, streamName string, consumerName string, msg *nats.Msg) error {
	consumer, err := js.ConsumerInfo(streamName, consumerName)
	if err != nil {
		return fmt.Errorf("obtaining publish once consumer information: %w", err)
	}
	if int(consumer.NumPending)+consumer.NumAckPending+consumer.NumWaiting == 0 {
		if lock, err := Lock(lockingKV, consumerName); err != nil {
			return fmt.Errorf("obtaining lock for publish once consumer: %w", err)
		} else if lock {
			defer func() {
				// clear the lock out of courtesy
				if err := UnLock(lockingKV, consumerName); err != nil {
					slog.Warn("releasing lock for publish once consumer")
				}
			}()
			if _, err := js.PublishMsg(msg); err != nil {
				return fmt.Errorf("starting publish once message: %w", err)
			}
		}
	}
	return nil
}

// PublishObj publishes a proto message to a subject.
func PublishObj(ctx context.Context, conn NatsConn, subject string, prot proto.Message, middlewareFn func(*nats.Msg) error) error {
	msg := nats.NewMsg(subject)
	b, err := proto.Marshal(prot)
	if err != nil {
		return fmt.Errorf("serialize proto: %w", err)
	}
	msg.Data = b
	if middlewareFn != nil {
		if err := middlewareFn(msg); err != nil {
			return fmt.Errorf("middleware: %w", err)
		}
	}
	if err = conn.PublishMsg(msg); err != nil {
		return fmt.Errorf("publish message: %w", err)
	}
	return nil
}
