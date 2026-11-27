import Image from 'next/image'

type Props = { largura?: number; className?: string }

// Logo do Lev (símbolo + nome). Decorativo: o nome acessível fica no título da tela.
export function Logo({ largura = 120, className }: Props) {
  const altura = Math.round((largura * 630) / 452)
  return (
    <Image
      src="/logo.png"
      alt=""
      aria-hidden="true"
      width={largura}
      height={altura}
      priority
      className={className}
    />
  )
}
