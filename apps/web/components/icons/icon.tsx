import styles from './styles.module.css';

import Image from 'next/image';

export default function Icon({
  src,
  width,
  height,
  color,
}: {
  src: string;
  width: number;
  height: number;
  color?: string;
}): JSX.Element {
  return (
    <div
      className={styles.icon}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color ?? '',
        maskImage: color ? `url(${src})` : '',
        WebkitMaskImage: color ? `url(${src})` : '',
      }}
    >
      {color ? '' : <Image src={src} width={width} height={height} alt="" />}
    </div>
  );
}
