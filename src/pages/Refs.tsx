import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

type Refs = {
    id: number
    name: string
    code: string
    type: TypeRef
    active: boolean
    printable: boolean
    um: string
}

type ListResponseRefs = {
    data: Refs
}

type Normal_Values = {
    ref_id: number
    id?: number
    sex: Sex
    um: Um
    age_from: number
    age_to:  number
    min: string
    max: string
    status?: Status
}
type ListResponseNormal_Values= {
    data: Normal_Values[]
}

type Status = 'existing' | 'new' | 'edited' | 'deleted'
type TypeRef = 'NUMBER' | 'TEXT'
type Sex = 'MALE' | 'FEMALE'
type Um = 'YEARS' | 'MONTHS' | 'DAYS'


export default function Refs () {

    const { id } = useParams()
    const navigate = useNavigate()

    const [nameRef, setNameRef] = useState('')
    const [codeRef, setCodeRef] = useState('')
    const [typeRef, setTypeRef] = useState<TypeRef>('NUMBER')
    const [activeRef, setActiveRef] = useState(true)
    const [printableRef, setPrintableRef] = useState(true)
    const [umRef, setUmRef] = useState('')

    const [refs, setRefs] = useState<Refs[]>([])


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)


    //normal_values

    const [um, setUm] = useState('')
    const [sex, setSex] = useState<Sex>()
    const [ageFrom, setAgeFrom] = useState()
    const [ageTo, setAgeTo] = useState()
    const [min, setMin] = useState('')
    const [max, setMax] = useState('')

    const [normal_Values, setNormal_Values] = useState<Normal_Values[]>([])

    // const newObj: Normal_Values[] = [
    //     {id:1 , sex: 'MALE', um: 'u/l', ageFrom: '5', ageTo: '54',min: '2', max: '9' },
    //     {id: 2, sex: 'FEMALE', um: 'u/l', ageFrom: '5', ageTo: '54', min: '5', max: '20'}
    // ]
    // const newObj: Normal_Values = {idT: 3 , sex: 'MALE', um: 'u/l', ageFrom: '5', ageTo: '54',min: '2', max: '9' , status: 'existing' }
    // setNormal_Values(items)

    


    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if(!id) {
            navigate('/investigations', { replace:  true })
            return
        }

        setSubmitting(true)
        try{

            const payload = {
                investigation_id: id,
                name: nameRef,
                code: codeRef,
                type: typeRef,
                active: activeRef,
                printable: printableRef,
                umRef: umRef,
            }
            console.log(payload)

            await api.patch(`api/v1/refs/${id}`, payload)

        }catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Eroare la updatarea referintei')
        } finally {
            setSubmitting(false)
        }
    }

    async function addNormal_Values() {
        if(!id) return

        // const idT =  Date.now()
        const tempM: Normal_Values = {
            ref_id: Number(id),
            id: Date.now(),
            sex: 'MALE',
            um: 'YEARS',
            age_from: 0,
            age_to:  0,
            min: '',
            max: '',
            status: 'new',
        }
        const tempF: Normal_Values = {
            ref_id: Number(id),
            id: Date.now()+1,
            sex: 'FEMALE',
            um: 'YEARS',
            age_from: 0,
            age_to:  0,
            min: '',
            max: '',
            status: 'new',
        }
        setNormal_Values(prev => [...prev, tempM])
        setNormal_Values(prev => [...prev, tempF])
        // setNormal_Values(prev => [...prev, newObj])

    }





    async function handleCreateNormalValues() {
        // console.log(normal_Values)

        if(normal_Values.some(s => s.status ==='new')) {
            try {
                setLoading(true)
                const items = normal_Values
                //filtram arrayul pe baza statusului
                .filter(prev =>prev.status === 'new')
                //filtram obiectele, pastram doar ce avem in dto
                .map(({ref_id, sex , um , age_from , age_to , min , max}) => ({
                    ref_id, sex , um , age_from, age_to , min , max
                }))

                const { data } = await api.post('api/v1/normal_values', items)
                
            } catch (e: any){
                setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la crearea valorilor normale')
            } finally {
                setLoading(false)
            }
        }
        // patch
        if(normal_Values.some(s => s.status ==='edited')) {
            try {
                setLoading(true)
                const items = normal_Values
                //filtram arrayul pe baza statusului
                .filter(prev =>prev.status === 'edited')
                //filtram obiectele, pastram doar ce avem in dto
                .map(({id, ref_id, sex , um , age_from , age_to , min , max}) => ({
                    id, ref_id, sex , um , age_from, age_to , min , max
                }))


                const { data } = await api.patch('api/v1/normal_values', items)
                
            } catch (e: any){
                setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la updatarea valorilor normale')
            } finally {
                setLoading(false)
            }
        }
        // deleted
        if(normal_Values.some(s => s.status ==='deleted')) {
            try {
                setLoading(true)
                const items = normal_Values
                //filtram arrayul pe baza statusului
                .filter(prev =>prev.status === 'deleted')
                //filtram obiectele, pastram doar ce avem in dto
                .map(({id}) => ({id}))
                
                const { data } = await api.delete('api/v1/normal_values',{ data: {items} })
                fetchNormal_Values()
            } catch (e: any){
                setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la stergere')
            } finally {
                setLoading(false)
            }
        }
    }





    useEffect(() => {
        if(!id) return

        (async () =>{
            try{
                setLoading(true)
                
                const { data } = await api.get<ListResponseRefs>(`api/v1/refs/${id}/ref`)
                const items = data.data
                console.log(items)
                // setNameRef(items)
                setNameRef(items.name)
                setCodeRef(items.code)
                setTypeRef(items.type)
                setActiveRef(items.active)
                setPrintableRef(items.printable)
                setUmRef(items.um)
                fetchNormal_Values()


            } catch(e: any) {
                if(e?.response?.status === 401) return navigate("/login", { replace: true })
                if(e?.response?.status === 404) return navigate("/investigations", { replace: true })
            } finally {
                setLoading(false)
            }
        })()
    }, [id, navigate])

    async function fetchNormal_Values() {
        setLoading(true)
        try {
            const ref_id = id
            const {data} = await api.get<ListResponseNormal_Values>(`api/v1/normal_values/${id}`)
            const items = data.data.map(i => ({...i, status: 'existing' as Status}))
            setNormal_Values(items)

        } catch(e:any){
            if(e?.response?.status === 401) return navigate("/login", { replace: true })
        } finally {
            setLoading(false)
        }
    }


    return (
        <div>
            <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
                <form onSubmit={handleCreate} className="grid grid-cols-6 gap-3">
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

                    <input
                     type="text"
                     value={umRef}
                     onChange={(e) => setUmRef(e.target.value)}
                     placeholder="Unitatea de masura"
                     className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                     />  


                     <select value={typeRef} onChange={(e) => setTypeRef(e.target.value as TypeRef)} className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
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

                    <button type="submit" disabled={submitting} className="col-span-2 h-10 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        {submitting ? 'Se modifica' : 'Modifica'}
                    </button>
                </form>
            </section>
            {id ?
             <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">

                <button onClick={addNormal_Values} className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">Adauga valori de referinta</button>
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-slate-800 bg-slate-950/80">
                                <th className="px-4 py-3 text-slate-300">Sex</th>
                                <th className="px-4 py-3 text-slate-300">Unitate de masura</th>
                                <th className="px-4 py-3 text-slate-300">Varsta minima</th>
                                <th className="px-4 py-3 text-slate-300">Varsta maxima</th>
                                <th className="px-4 py-3 text-slate-300">Minim</th>
                                <th className="px-4 py-3 text-slate-300">Maxim</th>
                            </tr>
                        </thead>
                        <tbody id="table-normal-values">
                            {normal_Values.map(i => (
                            <tr key= {i.id} className={`border-b border-slate-800 hover:bg-slate-900/40 transition ${i.status === 'deleted' ? 'bg-red-500' : ''}`}>
                                <td className="px-4 py-3">
                                    <select value={i.sex ?? ''} onChange={(e) => {
                                        const newSex = e.target.value;
                                        setNormal_Values(prev =>
                                            prev.map(item =>
                                                item.id === i.id ? {...item, sex: newSex as Sex, status: item.status === 'existing' ? 'edited' : item.status} : item
                                            )
                                        );
                                    }}  className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                                        <option value="MALE">Masculin</option>
                                        <option value="FEMALE">Feminin</option>
                                    </select>
                                    </td>
                                <td className="px-4 py-3">
                                    <select value={i.um ?? ''} onChange={(e) => {
                                        const newUm = e.target.value
                                        setNormal_Values(prev =>
                                            prev.map(p =>
                                                p.id === i.id ? {...p, um: newUm as Um, status: p.status === 'existing' ? 'edited' : p.status} : p
                                            )
                                            // .map(w => w.id === i.id && w.status === 'existing' ? {...w, status: 'edited' as Status} : w)
                                        )
                                    }
                                    }
                                      className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                                        <option value="YEARS">Ani</option>
                                        <option value="MONTHS">Luni</option>
                                        <option value="DAYS">Zile</option>
                                    </select>
                                    </td>

                                <td className="px-4 py-3">

                                    <input
                                    type="text"
                                    value={i.age_from ?? 0}
                                    onChange={(e) => {
                                        const newAgeFrom = Number(e.target.value)
                                        !isNaN(newAgeFrom)  ? 
                                        setNormal_Values(prev =>
                                            prev.map(item => 
                                                item.id === i.id ? {...item, age_from: newAgeFrom , status: item.status === 'existing' ? 'edited' : item.status} : item
                                            )
                                        ) : ''
                                        
                                    }}
                                    placeholder="Varsta minima"
                                    className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                                    />

                                    </td>
                                <td className="px-4 py-3">

                                    <input
                                    type="text"
                                    value={i.age_to ?? ''}
                                    onChange={(e) => {
                                        const newAgeTo = Number(e.target.value)
                                        !isNaN(newAgeTo) ? 
                                        setNormal_Values(prev =>
                                            prev.map(item => 
                                                item.id === i.id ? {...item, age_to: newAgeTo, status: item.status === 'existing' ? 'edited' : item.status} : item
                                            )
                                        ) : ''
                                    }}
                                    placeholder="Varsta maxima"
                                    className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                                    />  

                                    </td>
                                <td className="px-4 py-3">

                                    <input
                                    type="text"
                                    value={i.min ?? ''}
                                    onChange={(e) => {
                                        const newMin = e.target.value
                                        setNormal_Values(prev =>
                                            prev.map(item => 
                                                item.id === i.id ? {...item, min: newMin, status: item.status === 'existing' ? 'edited' : item.status} : item
                                            )
                                        )
                                    }}
                                    placeholder="Minim"
                                    className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                                    />

                                    </td>
                                <td className="px-4 py-3">

                                    <input
                                    type="text"
                                    value={i.max ?? ''}
                                    onChange={(e) => {
                                        const newMax = e.target.value
                                        setNormal_Values(prev =>
                                            prev.map(item => 
                                                item.id === i.id ? {...item, max: newMax, status: item.status === 'existing' ? 'edited' : item.status} : item
                                            )
                                        )
                                    }}
                                    placeholder="Maxim"
                                    className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                                    />

                                    </td>
                                <td className="px-4 py-3">
                                    <button onClick={(e) => {
                                        setNormal_Values(prev => 
                                            prev.map(p =>
                                                p.id === i.id? {...p, status: 'deleted' as Status} : p
                                            )
                                            // .filter(p => 
                                            //     p.id !== i.id
                                            // )
                                            
                                        )
                                    }} className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30">X</button>
                                    </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </section>
             
             : <div></div> }
             <section>
                    <button onClick={handleCreateNormalValues} className="h-10 px-5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">Salveaza</button>
             </section>
             
        </div>
    )
}