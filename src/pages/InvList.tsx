import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'
import Investigations from './Investigations'
import { Link } from 'react-router-dom'

type Investigations = {
    id: number
    name: string
    machinesId: string
    machines: { name: string }
    code: string
    active: boolean
}

type ListResponseInvestigations = {
    data: Investigations[]
}

export default function InvList () {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const [items, setItems] = useState<Investigations[]>([])

    async function fetchList() {
        setLoading(true)
        setError(null)

        try {
            const { data } = await api.get<ListResponseInvestigations>('api/v1/investigations')

            setItems(data.data)

        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la listarea aparatelor')
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        fetchList()
    }, [])

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
            <div className='rounded-xl border border-slate-800 overflow-hidden'> 
                <table className='w-full text-sm'>
                    <thead>
                        <tr className="text-left border-b border-slate-800 bg-slate-950/80">
                            <th className="px-4 py-3 font-semibold text-slate-200">Numele investigatiei</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Codul intern</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Aparatul</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Activ?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((tx) => (
                            <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-900/40 transition">
                                <td className="px-4 py-3"><Link to={`/investigations/${tx.id}`} className="text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">{tx.name}</Link></td>
                                <td className="px-4 py-3">{tx.code}</td>
                                <td className="px-4 py-3 text-slate-300">{tx.machines.name}</td>
                                <td className="px-4 py-3">{tx.active ? "Da" : "Nu"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </section>
            <div className="flex items-center justify-between"> <Link to={'/investigations'}><button className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">Adauga o noua investigatiei</button></Link></div>
        </div>
    )
}