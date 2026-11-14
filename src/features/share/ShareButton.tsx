import { useState } from 'react'
import { Button } from '../../ui'
import { campaignShareUrl, shareCampaign } from './share'

type ShareButtonProps = {
  /** Texto curto que acompanha o link. */
  text?: string
  fullWidth?: boolean
}

const DEFAULT_TEXT =
  'Sua próxima reunião merece um pouco de código de cor. Raspe o seu Air Force 1:'

/** Compartilha o link da campanha (menu nativo ou cópia do link). */
export function ShareButton({ text = DEFAULT_TEXT, fullWidth = false }: ShareButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleClick() {
    const result = await shareCampaign({
      title: 'Código de Cor — Air Force 1',
      text,
      url: campaignShareUrl(window.location.origin),
    })
    setFeedback(
      result === 'copied'
        ? 'Link copiado'
        : result === 'failed'
          ? 'Não foi possível compartilhar.'
          : null,
    )
  }

  return (
    <span className={fullWidth ? 'block' : 'inline-flex flex-col'}>
      <Button variant="secondary" fullWidth={fullWidth} onClick={handleClick}>
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          aria-hidden="true"
        >
          <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        Compartilhar
      </Button>
      <span role="status" aria-live="polite" className="mt-1 min-h-4 text-xs text-mute">
        {feedback}
      </span>
    </span>
  )
}
