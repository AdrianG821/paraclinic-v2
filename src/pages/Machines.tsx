import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'

type MachinesReq = {
    id: number
    name: string,
    domain_id: number,
    domains: { name: string }
    lab_id: number
    method: string,
    active: boolean
    createAt: string
}

type DomainsReq = {
    id: number
    name: string
    id_laboratory: number
}

type ListResponseMachinesReq = {
    data: MachinesReq[]
}

type ListResponseDomainsReq = {
    data: DomainsReq[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const dd = d.toLocaleDateString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit' })
  return dd
}

export default function Machines () {
    
    const {id} = useParams()
    const navigate = useNavigate()

    const [machineName, setMachineName] = useState('')
    const [workMethod, setWorkMethod] = useState<string | undefined>(undefined)
    const [active, setActive] = useState(true)
    const [laboratory, setLaboratory] = useState(1)
    const [domain, setDomain] = useState('')

    const [gDomains, setGDomains] = useState<DomainsReq[]>([])
    const [gMachines, setGMachines] = useState<MachinesReq[]>([])
    const [machine, setMachine] = useState<MachinesReq | null>(null)


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [loaded, setLoaded] = useState(false)
 
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        console.log("hello")

        setSubmitting(true)

        const payload: any = {
            name: machineName,
            domain_id: domain,
            lab_id: laboratory,
            method: workMethod,
            active: active, 
        }

        if(id) {
            await api.patch(`api/v1/machines/${id}`, payload)
            setSubmitting(false)

            return
        }
        try{

            const lab = gDomains.map(d => {
                if(d.id === Number(domain)) {
                    setLaboratory(d.id_laboratory)
                }
            })

            // console.log(laboratory)


            console.log(payload)

            await api.post('api/v1/machines', payload)
            setActive(true)
            setMachineName('')
            setDomain('')
            setWorkMethod('')
            fetchList()

        }catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Eroare la crearea aparatului!')
        } finally {
            setSubmitting(false)
        }
    }

    async function fetchListDomains() {
        setLoading(true)
        setError(null)

        try {
            const { data } = await api.get<ListResponseDomainsReq>('/api/v1/machines/domains')
            const items = data.data
            setGDomains(items)

        } catch (error: any) {
            setError(error?.response?.data?.message ?? error?.message ?? 'Eroare la listare')
        } finally {
            setLoading(false)
        }
    }

    async function fetchList() {
        setLoading(true)
        setError(null)

        try {
            const { data } = await api.get<ListResponseMachinesReq>('/api/v1/machines')
            setGMachines(data.data)
            // console.log(data.data)
            
        } catch(error: any) {
            setError(error?.response?.data?.message ?? error?.message ?? 'Eroare la listare')
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchListDomains()
    }, [])
    
    useEffect(() => {
        if(!id) {
            setMachineName('')
            setDomain('')
            setWorkMethod('')
            setActive(true)
            fetchList()
            fetchListDomains()
            setLoaded(false)
            return
        }
        (async () => {
            try {
                
                
                setLoading(true)
                const { data } = await api.get(`api/v1/machines/${id}`)
                setMachine(data.data)
                console.log(machine)
                setMachineName(data.data.name)
                console.log(machineName)
                setDomain(data.data.domain_id)
                console.log(domain)
                setWorkMethod(data.data.method)
                setActive(data.data.active)
                setLoaded(true)

            } catch(e: any) {
                if(e?.response?.status === 401) return navigate( "/login" , {replace: true})
                if(e?.response?.status === 404) return navigate("/machines" , { replace: true })
            } finally {
                setLoading(false)
            }
         })()
    }, [id, navigate])


    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
                <form onSubmit={handleCreate} className="grid grid-cols-6 gap-3">
                    <input
                     type="text" 
                     minLength ={3}
                     value ={machineName}
                     onChange={(e) => setMachineName(e.target.value)}
                     placeholder="Numele aparatului"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                     />

                    {
                    <select
                        value={domain ?? ''} 
                        onChange={(e) => setDomain(e.target.value)}
                        className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="" disabled> Alege domeniul</option>
                        {gDomains.map(d => (
                            <option value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    }

                    <input
                     type="text" 
                     value ={workMethod}
                     onChange={(e) => setWorkMethod(e.target.value)}
                     placeholder="Metoda de lucru?"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                     />

                     <label className="col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                        <input
                         type="checkbox"
                         checked={active}
                         onChange={(e) => setActive(e.target.checked)}
                         className="h-4 w-4 accent-emerald-500"
                          />
                        Activ?
                     </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="col-span-2 h-10 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        {submitting ? 'Se adauga' : loaded ? 'Modifica' : 'Adauga'}
                    </button>                     
                </form>
            </section>
            {loaded ? <div></div> : 
            <section id="s1" className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-slate-800 bg-slate-950/80">
                                <th className="px-4 py-3 font-semibold text-slate-200">Numele aparatului</th>
                                <th className="px-4 py-3 font-semibold text-slate-200">Numele domeniului</th>
                                <th className="px-4 py-3 font-semibold text-slate-200">Numele laboratorului</th>
                                <th className="px-4 py-3 font-semibold text-slate-200">Metoda de lucru</th>
                                <th className="px-4 py-3 font-semibold text-slate-200">Activ?</th>
                                <th className="px-4 py-3 font-semibold text-slate-200">Data crearii</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gMachines.map(m => (
                                
                                <tr key= {m.id} className="border-b border-slate-800 hover:bg-slate-900/40 transition" >                                        
                                    <td className="px-4 py-3 text-slate-300"><Link to={`/machines/${m.id}`} className="text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">{m.name}</Link></td>
                                    <td className="px-4 py-3 text-slate-300">{m.domains.name}</td>   
                                    <td className="px-4 py-3 text-slate-300">{m.lab_id}</td> 
                                    <td className="px-4 py-3 text-slate-300">{m.method}</td> 
                                    <td className="px-4 py-3 text-slate-300">{m.active ? "Da" : "Nu"}</td>   
                                    <td className="px-4 py-3 text-slate-300">{formatDate(m.createAt)}</td>                              
                                </tr>
                                
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>}
        </div>
    )
}