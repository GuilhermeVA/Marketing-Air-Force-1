import { useMemo } from 'react'
import { useAuth } from '../features/auth'
import { createCouponApi } from '../features/coupon/api'
import { CouponView } from '../features/coupon/CouponView'

export function CouponPage() {
  const { client, user } = useAuth()
  const api = useMemo(() => createCouponApi(client), [client])
  // A key recria a tela ao trocar de usuário, recarregando o cupom da conta certa.
  return <CouponView key={user?.id} api={api} />
}
