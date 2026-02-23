import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useParams , useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

type Domain = {
    id: number
    name: string
    id_laboratory: number
}

type ListResponse = {
    data: Domain[]
}

export default function Domains () {

    const { id }= useParams()
    const navigate = useNavigate()


    const [domain, setDomain] = useState<Domain | null>(null)

    const [domainsList, setDomainsList] = useState<Domain []>([])

    const [domainName, setDomainName] = useState('')
    const [laboratryDomain, setLaboratoryDomain] = useState(1)


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [loaded, setLoaded] = useState(false)
    
    async function fetchList() {
        setLoading(true)
        setError(null)

        try {
            const { data } = await api.get<ListResponse>('api/v1/domains')
            setDomainsList(data.data)
            setLoaded(false)

        } catch(error: any) {   
            setError(error?.response?.data?.message ?? error?.message ?? "Eroare la listare")
        } finally {
            setLoading(false)
        }

    }
    

    useEffect(() => {
        if(!id) {
            setDomainName('')
            fetchList()
            return
        }
        (async () => {
            try {
                setLoading(true)
                const { data } = await api.get(`api/v1/domains/${id}`)
                setDomain(data)
                setDomainName(data.name)
                setLoaded(true)

            } catch (e: any) {
                if(e?.response?.status === 401) return navigate("/login" , { replace: true })
                if(e?.response?.status === 404) return navigate("/domains" , { replace: true })
            } finally {
                setLoading(false)
            }
        })()
    }, [id, navigate])

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        setSubmitting(true)
        const payload: any = {
            name: domainName,
            id_laboratory: laboratryDomain,
        }
        if (id) {
            await api.patch(`api/v1/domains/${id}`, payload)

            return
        }

        try{

            await api.post('api/v1/domains', payload)
            fetchList()
            

        }catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Eroare la crearea domeniului!')
        } finally {
            setSubmitting(false)
        }
    }

    // if (!id) return <div className="domain-page-creator">ID lipsa in URL.</div>
    if (loading) return <div className="text-slate-300">Se încarcă…</div>
    if (error) return <div className="text-rose-300">Eroare: {error}</div>
    // if (!domain) return <div className="ticket-details-page">Nu exista domeniul.</div>

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6">
                <form onSubmit={handleCreate} className="grid grid-cols-6 gap-3">
                    <input 
                        type="text"
                        minLength={3}
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        placeholder="Numele domeniului"
                        className="col-span-5 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                    />
                    <button type="submit" disabled={submitting} className="col-span-1 h-10 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                        {submitting ? 'Se adauga' : loaded ? 'Modifica' : 'Adauga'}
                    </button>
                </form>
            </section>
            {loaded ? <div></div> : 
            <section id="s1" className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-slate-800 bg-slate-950/80">
                            <th className="px-4 py-3 font-semibold text-slate-200">Numele domeniului</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Laboratorul</th>
                        </tr>
                    </thead>
                    <tbody>
                        {domainsList.map (d => (
                            
                            <tr key= {d.id} className="border-b border-slate-800 hover:bg-slate-900/40 transition" >                       
                                <td className="px-4 py-3 text-slate-300"> <Link to={`/domains/${d.id}`} className="text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">{d.name}</Link></td>
                                <td className="px-4 py-3 text-slate-300">{d.id_laboratory}</td>    
                            </tr>
                            
                        ))

                        }

                        
                    </tbody>
                </table>
            </section> }
        </div>
    )
}