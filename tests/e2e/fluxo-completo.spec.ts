import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// Caminho feliz do MVP: link → raspadinha → cadastro → resgate → cupom → closet → tela do tênis.

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return errors
}

test('fluxo completo do visitante até o tênis desbloqueado', async ({ page }) => {
  const errors = trackErrors(page)
  const email = `e2e-${Date.now()}@example.com`

  await page.goto('/?utm_source=e2e')
  await page.getByRole('button', { name: 'Revelar' }).click()
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveText(/^Seu par: /)
  const color = (await heading.textContent())!.replace('Seu par: ', '')
  // Palavras-chave e significado aparecem na própria raspadinha.
  const meaning = page.getByRole('region', { name: 'O que esta cor simboliza' })
  await expect(meaning.getByRole('listitem')).not.toHaveCount(0)
  await expect(meaning.locator('p')).toHaveText(/.{40,}/)

  await page.getByRole('link', { name: 'Guardar no meu closet' }).click()
  await expect(page.getByRole('button', { name: 'Criar conta e guardar' })).toBeDisabled()
  await page.getByLabel('Como podemos te chamar').fill('E2E')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill('senha-forte-1')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Criar conta e guardar' }).click()

  await expect(page.getByText(/Guardado no seu closet/)).toBeVisible()
  await page.getByRole('link', { name: 'Ver meu cupom' }).click()
  await expect(page.getByText(/^AF1-[A-HJ-NP-Z2-9]{4}$/)).toBeVisible()
  await expect(page.getByText('10%')).toBeVisible()
  await page.getByRole('button', { name: 'Copiar código' }).click()
  await expect(page.getByText('Código copiado')).toBeVisible()

  await page.getByRole('link', { name: 'Ver meu closet' }).click()
  await expect(page.getByText('1 de 7 pares')).toBeVisible()
  await page.getByRole('link', { name: color, exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: color })).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'O que esta cor simboliza' }).getByRole('listitem'),
  ).not.toHaveCount(0)

  await page.getByRole('link', { name: '‹ Closet' }).click()
  await page.locator('ul a[aria-label$="bloqueado"]').first().click()
  await expect(page.getByText('Desbloqueie esse tênis para ver o que ele simboliza.')).toBeVisible()

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Por hoje é só' })).toBeVisible()

  expect(errors).toEqual([])
})

test('a raspadinha pode ser revelada só com o teclado', async ({ page }) => {
  await page.goto('/')
  const reveal = page.getByRole('button', { name: 'Revelar' })
  await expect(reveal).toBeVisible()
  for (let i = 0; i < 10 && !(await reveal.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab')
  }
  await expect(reveal).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Seu par: /)
})

test('rotas abertas direto pelo link não mostram a estrutura da tela inicial', async ({ page }) => {
  await page.goto('/privacidade')
  await expect(page.getByRole('heading', { level: 1, name: 'Privacidade' })).toBeVisible()
  await expect(page.getByText('Sua próxima reunião merece um pouco de cor')).toHaveCount(0)
})
