import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import type { ReactFormState } from 'react-dom/client'


type Lab_Requests = {
    id: number
    rcode: string
    pacient: {first_name: string , last_name: string}
    status: 'In lucru' | 'Terminata'
    createdAt: string
}

/**FLUX => DACA AVEM COD DE CERERE => CAUTA DUPA CERERE => RESTUL FILTRELOR FILTREAZA CERERILE IN FUNCTIE DE FILTRE */

export default function Lab_Requests() {

    const [reqCode, setReqCode] = useState('')
    const [fromDate, setFromDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [patient, setPatient] = useState('')
    const [paymentType, setPaymentType] = useState('')
    const [verified, setVerified] = useState(1)
    const [status, setStatus] = useState('')

    const [requests, setRequests] = useState<Lab_Requests[]>([])

    

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [popError,setPopError] = useState<string | null>(null)
    const [pop,setPop] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()


    useEffect(() => {
        const today = new Date()
        const formatted = today.toLocaleDateString('ro-RO')
        setFromDate(formatted)
        setEndDate(formatted)

        fetchRequest(formatted,formatted)
    }, [])

    /*****************************************Search****************************************************************/


    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setPopError(null)
        setError(null)

        try{
            if(reqCode){
                try{
                    const { data } = await api.get('api/v1/requests/find/request', {params: {reqCode}})
                    // console.log('Avem reqcode')
                    navigate(`/analyse/${data.id}`)
                } catch (e: any){
                    if(e?.response?.status === 404) {
                        setPopError("Nu a fost gasita cererea!!") 
                        return setPop(true)
                    } else if(e?.response?.status === 400) {
                        setPopError("Introduceti un cod de cerere valid!!") 
                        return setPop(true) 
                    }
                }
                return
            } else if(patient) {

                return 
            } else if(fromDate) {
                fetchRequest(fromDate, endDate)
                return
            }
        } catch (e: any) {

        }

    }

    /*****************************************navigate****************************************************************/

    function handleNavigation(i: number) {
        navigate(`/analyse/${i}`);
    };


    /*****************************************fetch****************************************************************/

    async function fetchRequest(fromDateParam: string, endDateParam: string) {
        const from =  toISO(formatDate(fromDateParam))
        const end =  toISO(formatDate(endDateParam))
        
        if(!from || !end) {
            setPopError("Selectati o data valida!!") 
            return setPop(true)
        }

        const payload = {
            fromDate: from,
            endDate: end,
        }

        try{
            const { data } = await api.post('api/v1/requests/all', payload)
            // console.log(data)
            setRequests(data)
        } catch(e:any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Eroare la listarea investigatiilor")
        }
    }
    /*****************************************errors****************************************************************/

    function handleErrors(){
        setPopError(null)
        setPop(false)
    }
    /*****************************************date****************************************************************/
        function formatDate(r: string): string {
        const digits = r.replace(/\D/g, '').slice(0, 8)

        const dd = digits.slice(0, 2)
        const mm = digits.slice(2, 4)
        const yyyy = digits.slice(4, 8)

        if(digits.length <= 2) return dd
        if(digits.length <= 4) return `${dd}-${mm}`

        return `${dd}-${mm}-${yyyy}`
    }


    function toISO(i: string): string | null {
        const s = i.trim()

        const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/)

        if(!m) return null

        const day = Number(m[1])
        const month = Number(m[2])
        const year = Number(m[3])

        const d = new Date(year, month - 1, day, 12 , 0 , 0)
        if(d.getFullYear()  !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null

        return d.toISOString()

    }
    /*****************************************Variables****************************************************************/

    return (
        <section>
            <div>
                
                <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
                    <h1 className='text-2xl font-semibold text-slate-100'>Cauta o cerere</h1>
                    <form onSubmit={handleSearch} className="grid grid-cols-6 gap-3">
                        <input 
                            type="text"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            placeholder="De la"
                            className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input 
                            type="text"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Pana la"
                            className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input 
                            type="text"
                            value={reqCode}
                            onChange={(e) => setReqCode(e.target.value)}
                            placeholder="Codul cererii"
                            className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        {/* <input 
                            type="text"
                            value={reqCode}
                            onChange={(e) => setReqCode(e.target.value)}
                            placeholder="Codul cererii"
                        /> */}
                        <input 
                            type="text"
                            value={patient}
                            onChange={(e) => setPatient(e.target.value)}
                            placeholder="Numele pacientului"
                            className="col-span-2 h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        {/* <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                            <option value="DONE">Terminata</option>
                        </select>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="DONE">Terminata</option>
                        </select>

                        <select value={verified} onChange={(e) => setVerified(Number(e.target.value))}>
                            <option value={1}>Da</option>
                            <option value={2}>Nu</option>
                        </select>

                        <input 
                            type="text"
                            value={reqCode}
                            onChange={(e) => setReqCode(e.target.value)}
                            placeholder="Codul cererii"
                        /> */}
                        <button type="submit" disabled={submitting} className="col-span-2 h-10 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                            {submitting ? 'Se cauta...' : 'Cauta'}
                        </button>
                    </form>
                    
                </section>
                <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
                  <div className="">
                    <h2 className="text-lg font-semibold text-slate-100">Lista cereri</h2>
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-slate-800 bg-slate-950/80">
                                    <th className="px-4 py-3 font-semibold text-slate-200">Codul cererii</th>
                                    <th className="px-4 py-3 font-semibold text-slate-200">Numele pacientului</th>
                                    <th className="px-4 py-3 font-semibold text-slate-200">Status</th>
                                    <th className="px-4 py-3 font-semibold text-slate-200">Urgenta</th>
                                    <th className="px-4 py-3 font-semibold text-slate-200 text-right">Tipul platii</th>
                                    <th className="px-4 py-3 font-semibold text-slate-200 text-right">Data cererii</th>
                                    <th className="px-4 py-3 font-semibold text-slate-200 text-right">Laboratorul</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((tx) => (
                                    <tr key= {tx.id} className="border-b border-slate-800 hover:bg-slate-900/40 transition cursor-pointer" onClick= {() => handleNavigation(tx.id)}>
                                        <td className="px-4 py-3 text-slate-100 font-medium">{tx.rcode}</td>
                                        <td className="px-4 py-3 text-slate-100">{tx.pacient.first_name} {tx.pacient.last_name}</td>
                                        <td className={`${tx.status === 'Terminata' ? 'text-green-600' : 'text-red-600'}`} style={{ padding: 6 }} >{tx.status}</td>
                                        <td className="px-4 py-3 text-slate-300">Normala</td>
                                        <td className="px-4 py-3 text-right text-slate-300">Spitalizare continua</td>
                                        <td className="px-4 py-3 text-right text-slate-300">{new Date(tx.createdAt).toLocaleDateString('ro-RO')}</td>
                                        <td className="px-4 py-3 text-right text-slate-300">Laboratorul de Analize Medicale</td>
                                    </tr>
                                ))}
                                
                            </tbody>
                        </table>
                    </div>
                </div>
                    <button className="h-10 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/30" disabled={loading} style={{ textAlign: 'left', borderRight: '1px solid #e5e5e5'   }} onClick={() => navigate("/analyse" , { replace: true })}>Adauga o cerere</button>
                </section>




                {pop && (
                    <div
                        onClick={() => 
                            handleErrors()
                            
                        }
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div
                        onClick={(e) => e.stopPropagation()} // nu închide când dai click în cutie
                        className="w-[min(520px,95vw)] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl p-6 space-y-4"
                        >

                        <div className=''><h3 className="text-lg font-semibold text-slate-100 text-center">{popError}</h3></div>
                        <div className='flex  justify-center'>
                        <button className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" onClick={() => handleErrors()}>Am inteles</button>
                        </div>
                        </div>
                    </div>
                )}

            </div>
        </section>

    )
}