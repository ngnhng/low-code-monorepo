package main

import (
	"fmt"
	"github.com/yoheimuta/go-protoparser"
	"github.com/yoheimuta/go-protoparser/parser"
	"os"
	"strings"
)

type enum struct {
	Member      []enumMember
	Description string
}

type enumMember struct {
	name        string
	value       string
	description string
}

type modelType struct {
	member      []modelMember
	Description string
}

type modelMember struct {
	name        string
	typ         string
	usesType    string
	description string
}

func main() {
	types, enums, err := parseProto()
	if err != nil {
		panic(err)
	}
	// now output the types as markdown
	err = outputDocs(types, enums, "TaskSpec", "model/taskspec.md")
	if err != nil {
		panic(err)
	}
}

func outputDocs(types map[string]modelType, enums map[string]enum, startAt string, filename string) error {
	wri, err := os.OpenFile(filename, os.O_TRUNC+os.O_CREATE+os.O_WRONLY, 0777)
	if err != nil {
		panic(fmt.Errorf("failed to open for write, err %v\n", err))
	}
	defer func() {
		if err := wri.Close(); err != nil {
			panic(err)
		}
	}()
	done := map[string]struct{}{}
	return output(types, enums, startAt, done, wri)
}

func parseProto() (map[string]modelType, map[string]enum, error) {
	rdr, err := os.Open("./proto/shar-workflow/models.proto")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open, err %v\n", err)
	}
	defer func() {
		if err := rdr.Close(); err != nil {
			panic(err)
		}
	}()

	md, err := protoparser.Parse(rdr)
	if err != nil {
		return nil, nil, fmt.Errorf("parsing proto parse: %w", err)
	}
	ret := map[string]modelType{}
	enumRet := map[string]enum{}

	for _, el := range md.ProtoBody {
		switch msg := el.(type) {
		case *parser.Enum:
			et := enum{
				Member:      make([]enumMember, 0),
				Description: msg.EnumName,
			}
			for _, eb := range msg.EnumBody {
				switch fld := eb.(type) {
				case *parser.EnumField:
					en := enumMember{
						name:  fld.Ident,
						value: fld.Number,
					}
					if fld.InlineComment != nil {
						if strings.Contains(fld.InlineComment.Raw, "//") {
							en.description = strings.SplitAfterN(fld.InlineComment.Raw, " ", 2)[1]
						}
					}
					et.Member = append(et.Member, en)
				}
			}
			enumRet[msg.EnumName] = et
		case *parser.Message:
			mt := modelType{
				member:      []modelMember{},
				Description: msg.MessageName,
			}
			for _, mb := range msg.MessageBody {
				switch fld := mb.(type) {
				case *parser.Field:
					if msg.MessageName == "RetryStrategy" {
						fmt.Println("strategy")
					}
					mb := modelMember{
						name:     fld.FieldName,
						typ:      fld.Type,
						usesType: fld.Type,
					}
					if fld.InlineComment != nil {
						if strings.Contains(fld.InlineComment.Raw, "//") {
							mb.description = strings.SplitAfterN(fld.InlineComment.Raw, " ", 2)[1]
						}
					}
					mt.member = append(mt.member, mb)
				case *parser.MapField:
					mb := modelMember{
						name:     fld.MapName,
						typ:      "map[" + fld.KeyType + "]" + fld.Type,
						usesType: fld.Type,
					}
					if fld.InlineComment != nil {
						if strings.Contains(fld.InlineComment.Raw, "//") {
							mb.description = strings.SplitAfterN(fld.InlineComment.Raw, " ", 2)[1]
						}
					}
					mt.member = append(mt.member, mb)
				}
			}
			ret[msg.MessageName] = mt
		}
	}
	return ret, enumRet, nil
}

func output(m map[string]modelType, enums map[string]enum, s string, done map[string]struct{}, f *os.File) error {
	todo := make(map[string]modelType)
	etodo := make(map[string]modelType)
	if _, ok := done[s]; ok {
		return nil
	}
	msg := m[s]
	if _, err := fmt.Fprintln(f, "###", s); err != nil {
		return fmt.Errorf("writing title: %w", err)
	}
	if _, err := fmt.Fprintln(f); err != nil {
		return fmt.Errorf("writing blank line: %w", err)
	}
	if _, err := fmt.Fprintln(f, "| name | type | description | validation |"); err != nil {
		return fmt.Errorf("writing titles: %w", err)
	}
	if _, err := fmt.Fprintln(f, "|------|------|-------------|------------|"); err != nil {
		return fmt.Errorf("writing table: %w", err)
	}
	for _, i := range msg.member {
		var validation = " "
		if _, ok := m[i.usesType]; ok {
			validation = " - "
			todo[i.usesType] = m[i.usesType]
		}
		if _, ok := enums[i.usesType]; ok {
			validation = " enum "
			etodo[i.usesType] = m[i.usesType]
		}
		desc := i.description
		if strings.Contains(desc, "valid-value:") {
			sp := strings.SplitN(desc, "valid-value:", 2)
			desc = strings.TrimSpace(sp[0])
			validation = strings.TrimSpace(sp[1])
		}
		if _, err := fmt.Fprintln(f, "|", i.name, "|", i.typ, "|", desc, "|", validation, "|"); err != nil {
			return fmt.Errorf("writing row: %w", err)
		}
	}
	done[s] = struct{}{}
	for k := range todo {
		if _, ok := done[k]; ok {
			continue
		}
		if err := output(m, enums, k, done, f); err != nil {
			return fmt.Errorf("recursing into type %s: %w", k, err)
		}
	}
	for k := range etodo {
		if _, ok := done[k]; ok {
			continue
		}
		if err := eoutput(enums, k, done, f); err != nil {
			return fmt.Errorf("recursing into enum %s: %w", k, err)
		}
	}
	return nil
}

func eoutput(enums map[string]enum, s string, done map[string]struct{}, f *os.File) error {
	if _, ok := done[s]; ok {
		return nil
	}
	msg := enums[s]
	if _, err := fmt.Fprintln(f, "###", s, "(Enum)"); err != nil {
		return fmt.Errorf("writing enum title: %w", err)
	}
	if _, err := fmt.Fprintln(f); err != nil {
		return fmt.Errorf("writing enum blank line: %w", err)
	}
	if _, err := fmt.Fprintln(f, "| name | value | description |"); err != nil {
		return fmt.Errorf("writing enum headings: %w", err)
	}
	if _, err := fmt.Fprintln(f, "|------|------|-------------|"); err != nil {
		return fmt.Errorf("writing enum separator: %w", err)
	}
	for _, i := range msg.Member {
		desc := i.description
		if strings.Contains(desc, "valid-value:") {
			sp := strings.SplitN(desc, "valid-value:", 2)
			desc = strings.TrimSpace(sp[0])
		}
		if _, err := fmt.Fprintln(f, "|", i.name, "|", i.value, "|", desc, "|"); err != nil {
			return fmt.Errorf("writing enum row: %w", err)
		}
	}
	done[s] = struct{}{}
	return nil
}
