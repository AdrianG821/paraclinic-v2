import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

type Machine = {
    id: number
    name: string
}
type Investigation = {
    id: number
    name: string
    machinesId: string
    code: string
    cas_name: string
    cas_code: string
    active: boolean
    printable: boolean
    work_method: string
    is_renar: boolean
    export_cas: boolean
}

type Refs = {
    id: number
    name: string
    code: string
    type: TypeRef
    active: boolean
    printable: boolean
}

type ListResponseRefs = {
    data: Refs[]
}

type ListResponseInvestigation = {
    data: Investigation
}

type ListResponseMachine = {
    data: Machine[]
}

type TypeRef = 'NUMBER' | 'TEXT'


export default function Investigations () {

    const { id } = useParams()
    const navigate = useNavigate()

    const [invName, setInvName] = useState('')
    const [code, setCode] = useState('')
    const [machineId, setMachineId] = useState('')
    const [casName, setCasName] = useState<string | undefined>(undefined)
    const [casCode, setCasCode] = useState<string | undefined>(undefined)
    const [active, setActive] = useState(true)
    const [printable, setPrintable] = useState(true)
    const [workMethod, setWorkMethod] = useState<string | undefined>(undefined)
    const [isRenar, setIsRenar] = useState(false)
    const [exportCas, setExportCas] = useState(false)


    const [machines,setMachines] = useState<Machine[]>([])
    // const [investigation, setInvestigation] = useState<Investigation | null>(null)



    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [loaded, setLoaded] = useState(false)

    //Refs

    const [nameRef, setNameRef] = useState('')
    const [codeRef, setCodeRef] = useState('')
    const [typeRef, setTypeRef] = useState<TypeRef>('NUMBER')
    const [activeRef, setActiveRef] = useState(true)
    const [printableRef, setPrintableRef] = useState(true)

    const [refs, setRefs] = useState<Refs[]>([])

    async function fetchMachines() {
        setLoading(true)
        setError(null)

        try {
            const { data } = await api.get<ListResponseMachine>('api/v1/investigations/machines')
            setMachines(data.data)
            // console.log(data)
        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la listarea aparatelor')
        } finally {
            setLoading(false)
        }

    }
    // useEffect(() => {
    //     fetchMachines()
    // }, [])

    useEffect(() => {
        if(!id) {
            fetchMachines()
            setLoaded(false)
            return
        }
        (async () => {
            try{
                setLoading(true)
                fetchMachines()
                fetchRefs()
                const { data } = await api.get<ListResponseInvestigation>(`api/v1/investigations/${id}`)
                // setInvestigation(data.data)
                const investigation = data.data
                setInvName(investigation.name)
                // console.log(invName)
                setActive(investigation.active)
                setCasCode(investigation.cas_code)
                setIsRenar(investigation.is_renar)
                setMachineId(investigation.machinesId)
                setWorkMethod(investigation.work_method)
                setCode(investigation.code)
                setCasName(investigation.cas_name)
                setExportCas(investigation.export_cas)
                setPrintable(investigation.printable)

                // console.log("helo")
                setLoaded(true)
            } catch (e: any) {
                if(e?.response?.status === 401) return navigate("/login", { replace: true })
                if(e?.response?.status === 404) return navigate("/investigations", { replace: true })
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
            name: invName,
            machinesId: machineId,
            code: code,
            cas_name: casName,
            cas_code: casCode,
            active: active,
            printable: printable,
            work_method: workMethod,
            is_renar: isRenar,
            export_cas: exportCas,
        }
        // console.log(payload)

        if(id) {
            try {
                await api.patch(`api/v1/investigations/${id}`, payload)

            } catch(e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la actualizarea investigatiei')
            }
            setSubmitting(false)
            return
        }

        try {
            const { data } = await api.post<ListResponseInvestigation>('api/v1/investigations', payload)
            const id = data.data.id
            navigate(`/investigations/${id}`, {replace: true})

        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la crearea investigatiei')
        } finally {
            setSubmitting(false)
        }

    }

    async function fetchRefs() {
        setLoading(true)
        setError(null)
        
        try {
            const { data } = await api.get<ListResponseRefs>(`api/v1/refs/${id}`)
            setRefs(data.data)

        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Eroare la listarea referintelor")
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateRef(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        setSubmitting(true)

        if(!id) return

        const payload = {
            investigation_id: id,
            name: nameRef,
            code: codeRef,
            type: typeRef,
            active: activeRef,
            printable: printableRef,
        }
        // console.log(payload)

        try {
            await api.post('api/v1/refs', payload)
            // console.log(payload)
            fetchRefs()

        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la crearea referintei')
        } finally {
            setSubmitting(false)
        }

    }

    return (
        <div className="space-y-6">
            <section className='rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6'>
                <form onSubmit={handleCreate} className="grid grid-cols-6 gap-3">
                    <input
                     type="text"
                     minLength={3}
                     value={invName}
                     onChange={(e) => setInvName(e.target.value)}
                     placeholder="Numele investigatiei"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                     />

                    <input
                     type="text"
                     minLength={1}
                     value={code}
                     onChange={(e) => setCode(e.target.value)}
                     placeholder="Codul intern"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                     />

                    {
                    <select value={machineId ?? ''} onChange={(e) => setMachineId(e.target.value)} className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        <option value="" disabled>Alege un aparat</option>
                        {machines.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>    
                    }

                    <input
                     type="text"
                     minLength={1}
                     value={casName ?? ""}
                     onChange={(e) => setCasName(e.target.value)}
                     placeholder="Numele CAS"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                     />

                    <input
                     type="text"
                     minLength={1}
                     value={casCode ?? ""}
                     onChange={(e) => setCasCode(e.target.value)}
                     placeholder="Codul CAS"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                     />

                    <input
                     type="text"
                     minLength={3}
                     value={workMethod ?? ""}
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

                     <label className="col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                        <input
                         type="checkbox"
                         checked={printable}
                         onChange={(e) => setPrintable(e.target.checked)}
                         className="h-4 w-4 accent-emerald-500"
                          />
                        Printabil?
                     </label>

                     <label className="col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                        <input
                         type="checkbox"
                         checked={exportCas}
                         onChange={(e) => setExportCas(e.target.checked)}
                         className="h-4 w-4 accent-emerald-500"
                          />
                        Export CAS?
                     </label>

                     <label className="col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                        <input
                         type="checkbox"
                         checked={isRenar}
                         onChange={(e) => setIsRenar(e.target.checked)}
                         className="h-4 w-4 accent-emerald-500"
                          />
                        Este acreditat renar?
                     </label>

                     <button type="submit" disabled={submitting} className="col-span-2 h-10 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                        {submitting ? 'Se adauga' : loaded ? 'Modifica' : 'Adauga'}
                     </button>

                </form>
            </section>
            { loaded ?  
            <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
                <h1 className="text-lg font-semibold text-slate-100">Adauga referinte</h1>
                
                <form onSubmit={handleCreateRef} className="grid grid-cols-6 gap-3">
   
                    <input
                     type="text"
                     minLength={3}
                     value={nameRef}
                     onChange={(e) => setNameRef(e.target.value)}
                     placeholder="Numele referintei"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                     />

                    <input
                     type="text"
                     minLength={1}
                     value={codeRef}
                     onChange={(e) => setCodeRef(e.target.value)}
                     placeholder="Codul de transmisie"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                     />    

                     <select value={typeRef} onChange={(e) => setTypeRef(e.target.value as TypeRef)} className="col-span-1 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        <option value="NUMBER">Numar</option>
                        <option value="TEXT">TEXT</option>
                     </select>

                    <label className="col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                    <input
                        type="checkbox"
                        checked={activeRef}
                        onChange={(e) => setActiveRef(e.target.checked)}
                        className="h-4 w-4 accent-emerald-500"
                        />
                    Activ?
                    </label>

                     <label className="col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                        <input
                         type="checkbox"
                         checked={printableRef}
                         onChange={(e) => setPrintableRef(e.target.checked)}
                         className="h-4 w-4 accent-emerald-500"
                          />
                        Printabil?
                     </label>

                    <button type="submit" disabled={submitting} className="col-span-1 h-10 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        {submitting ? 'Se adauga' : 'Adauga'}
                    </button>
                </form>
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-slate-800 bg-slate-950/80">
                            <th className="px-4 py-3 font-semibold text-slate-200">Nume</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Cod de transmisie</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Tip</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Activ?</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Printabil?</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        {refs.map(r => (
                            <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-900/40 transition">
                                <td className="px-4 py-3"><Link to={`/refs/${r.id}`} className="text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">{r.name}</Link></td>
                                <td className="px-4 py-3">{r.code}</td>
                                <td className="px-4 py-3">{r.type}</td>
                                <td className="px-4 py-3">
                                    <span className={r.active ? "text-emerald-300" : "text-slate-500"}>
                                            {r.active ? "Da" : "Nu"}
                                    </span>         
                                    </td>
                                <td className="px-4 py-3">
                                    <span className={r.printable ? "text-emerald-300" : "text-slate-500"}>
                                            {r.printable ? "Da" : "Nu"}
                                    </span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </section>
            : <div></div> }
        </div>
    )
}