import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'


export default function Payments () {

    const [paymentName, setPaymentName] = useState('')
    const [laboratryDomain, setLaboratoryDomain] = useState(1)


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault
        setError(null)

        setSubmitting(true)
        try{

            const payload: any = {
                name: paymentName,
                laboratory: laboratryDomain
            }

            await api.post('api/v1/domains', payload)

        }catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Eroare la crearea domeniului!')
        } finally {
            setSubmitting(false)
        }
    }


    return (
        <div>
            <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                    <input 
                        type="text"
                        placeholder='Numele tipului de plata'
                        value={paymentName}
                        />
                    <button type="submit">Salveaza</button>
                </form>
            </section>
        </div>
    )
}