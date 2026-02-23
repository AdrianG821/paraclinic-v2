import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useParams , useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

type SinglePatient = { 
    cnp: string
    date_of_birth: string
    domicile: string
    email: string
    first_name: string
    id: number
    last_name: string
    phone_number: string
    place_of_birth: string
}

type ListResponsePatient = { 
    data: SinglePatient
}

type MultiplePatients = { 
    email: string
    first_name: string
    id: number
    last_name: string
    phone_number: string
}


export default function Patients () {

    const { id }= useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState<SinglePatient>()
    const [multiplePatients, setMultiplePatients] = useState<MultiplePatients[]>([])

    const [patientFirstName, setPatientFirstName] = useState('')
    const [patientLastName, setPatientLastName] = useState('')
    const [patientCNP, setPatientCNP] = useState('')
    const [patientBirthday, setPatientBirthday] = useState('')
    const [patientPlaceOfBirth, setPatientPlaceOfBirth] = useState('')
    const [patientDomicile, setPatientDomicile] = useState('')
    const [patientEmail, setPatientEmail] = useState('')
    const [patientPhoneNumber, setPatientPhoneNumber] = useState('')

    const [patient_Id, setPatient_Id] = useState<Number>(0)


    const [loaded, setLoaded] = useState(false)
    const [openPopUpAddPacient,setOpenPopUpAddPacient] = useState(false)


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // ********************************************************************************************************

    async function handleModifyPatient() {
        setError(null)

        setSubmitting(true)
        const payload = {
            id: id,
            date_of_birth: patientBirthday,
            domicile: patientDomicile,
            email: patientEmail,
            first_name: patientFirstName,
            last_name: patientLastName,
            phone_number: patientPhoneNumber,
            place_of_birth: patientPlaceOfBirth
        }
        try{


            const { data } = await api.patch('api/v1/patients', payload)

        }catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Eroare la crearea domeniului!')
        } finally {
            setSubmitting(false)
        }
    }

    /****************************************************************************************** */

    useEffect(() => {
        if(!id) {
            fetchPatients()
            setLoaded(false)
            return
        }
        (async () => {
            try{
                const { data } = await api.get<ListResponsePatient>(`api/v1/patients/${id}`)
                setPatient(data.data)
                setLoaded(true)
                console.log(patient)
                if(data.data === null) setOpenPopUpAddPacient(true)
                setPatientFirstName(data.data.first_name)
                setPatientLastName(data.data.last_name)
                setPatientCNP(data.data.cnp)
                setPatientBirthday(data.data.date_of_birth)
                setPatientPlaceOfBirth(data.data.place_of_birth)
                setPatientDomicile(data.data.domicile)
                setPatientEmail(data.data.email)
                setPatientPhoneNumber(data.data.phone_number)
            } catch(e:any) {
                if(e?.response?.status === 401) return navigate("/login" , { replace: true })
                if(e?.response?.status === 404) return navigate("/patients" , { replace: true })
            }
        })()

    },[id, navigate])
    /****************************************************************************************** */

    function formatDate(r: string): string {
        const digits = r.replace(/\D/g, '').slice(0, 8)

        const dd = digits.slice(0, 2)
        const mm = digits.slice(2, 4)
        const yyyy = digits.slice(4, 8)

        if(digits.length <= 2) return dd
        if(digits.length <= 4) return `${dd}/${mm}`

        return `${dd}/${mm}/${yyyy}`
    }
    /****************************************************************************************** */
    function navigateToTheList() {
        setLoaded(false)
        
        setPatientFirstName('')
        setPatientLastName('')
        setPatientCNP('')
        setPatientBirthday('')
        setPatientPlaceOfBirth('')
        setPatientDomicile('')
        setPatientEmail('')
        setPatientPhoneNumber('')
        return navigate("/patients" , { replace: true })
    }
    /****************************************************************************************** */
    async function fetchPatients() {
        try{ 

            const { data } = await api.get('api/v1/patients/get/all')

            setMultiplePatients(data.data)
            console.log(data.data)

        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Eroare la incarcarea pacientilor")
        }
    }

    /****************************************************************************************** */


    return (
        <div className="space-y-6">
            <section id="s1" className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6">
            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-slate-800 bg-slate-950/80">
                            <th className="px-4 py-3 font-semibold text-slate-200">Numele de familie</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Prenumele</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Email</th>
                            <th className="px-4 py-3 font-semibold text-slate-200">Numarul de telefon</th>
                        </tr>
                    </thead>
                    <tbody>
                        {multiplePatients.map (d => (
                            
                            <tr key= {d.id} className="border-b border-slate-800 hover:bg-slate-900/40 transition">                       
                                <td className="px-4 py-3"> <Link to={`/patients/${d.id}`} className="text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">{d.first_name}</Link></td>
                                <td className="px-4 py-3">{d.last_name}</td>    
                                <td className="px-4 py-3 text-slate-300">{d.email}</td>    
                                <td className="px-4 py-3 text-slate-300">{d.phone_number}</td>    

                            </tr>
                            
                        ))
                        }
                    </tbody>
                </table>
            </div>
        </section> 
        {loaded && (
            <div
                onClick={() => navigateToTheList()}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <div
                onClick={(e) => e.stopPropagation()}
                className="w-[min(900px,95vw)] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl p-6 space-y-4"
                >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-semibold text-slate-100">Modifica pacient</h2>

                <button
                    type="button"
                    onClick={navigateToTheList}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                    X
                </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        min={3}
                        value={patientFirstName}
                        onChange={(e) => setPatientFirstName(e.target.value)}
                        placeholder="Numele de familie"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />
                    <input
                        type="text"
                        min={3}
                        value={patientLastName}
                        onChange={(e) => setPatientLastName(e.target.value)}
                        placeholder="Prenumele"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />
                    <input
                        value={patientCNP}
                        onChange={(e) => setPatientCNP(e.target.value)}
                        placeholder="CNP PACIENT"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />

                    <input
                        type="text"
                        value={patientBirthday}
                        onChange={(e) => setPatientBirthday(formatDate(e.target.value))}
                        placeholder="Data nasterii(ZIUA/LUNA/ANUL)"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />    
                    

                    <input
                        type="text"
                        value={patientPlaceOfBirth}
                        onChange={(e) => setPatientPlaceOfBirth(e.target.value)}
                        placeholder="Locul Nasterii"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />
                    <input
                        type="text"
                        value={patientDomicile}
                        onChange={(e) => setPatientDomicile(e.target.value)}
                        placeholder="Domiciliul"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />
                    <input
                        type="text"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="Email"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />

                    <input
                        type="text"
                        value={patientPhoneNumber}
                        onChange={(e) => setPatientPhoneNumber(e.target.value)}
                        placeholder="Telefon"
                        className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500/30"
                    />

                    </div>

                    <div className="flex justify-end">

                    <button className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-60" onClick={() => handleModifyPatient()}>Modifica pacientul</button>

                    </div>
                </div>
            </div>
        )}
        </div>
    )
}