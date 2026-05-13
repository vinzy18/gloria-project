type Props = {
  className?: string;
  width?: number;
  height?: number;
};

export default function LogoGMIM({ className, width = 60, height = 60 }: Props) {
  return (
    <img
      src="/logo-gmim.png"
      alt="Logo GMIM Gloria"
      width={width}
      height={height}
      className={className}
    />
  );
}
