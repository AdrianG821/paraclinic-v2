import { useState , useEffect} from "react"
import api from "../api/axios"
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Domains from "./Domains";
import { Fragment } from "react";
import { Link } from 'react-router-dom'
import { Trash2 , NotebookPen , Check , X , ArrowDownRight, ArrowUpRight , Printer} from "lucide-react";

type Investigations = {
    id: number
    name: string
    selected: boolean
}

type ReqInvestigations = {
    id: number
    request_id: number
    investigation_id: number
    normal_values?: {
         umComparison: 'DAYS' | 'MONTHS' | 'YEARS'
         age_from: number
         age_to: number
         min: string
         max: string
        }
    ref_id: number | null
    ref: { name: string | null , um: string}
    investigation: { id: number, name: string , machines : {id: number, name: string , domains: {id: number, name: string }}}
    result: string
    validated: boolean
}

type RefResults = {
    investigation_id: number
    ref: string
    result: string
    normal_values?: {
         min?: string
         max?: string
        }
    um: string
}

type Domain = { 
    id: number
    name: string
 }

type AddResult = {
    id: number
    investigation_id: 6
    investigation: {name: string , machinesId: number}
    type: 'NUMBER' | 'TEXT'
    name: string
    active: boolean
}

type MachinesList = {
    id: number
    machines: {name: string}
}

type MedicalReports = {
    id: number
    name: string
    link: string

}

type ListResponseMedicalReports = {
    data: MedicalReports[]
}

type Sex = 'MALE' | 'FEMALE'

/* TREBUIE SA ADUC LA RESULTS CINE A VALIDAT SI CU NUME */
/* FUNCTIA DE COMASARE A INVESTIGATIILOR */

export default function Analyse() {

    /*****************************************Variables****************************************************************/
    const { id } = useParams();
    const navigate = useNavigate();


    const [patientFirstName, setPatientFirstName] = useState('')
    const [patientLastName, setPatientLastName] = useState('')
    const [patientCNP, setPatientCNP] = useState('')
    const [patientBirthday, setPatientBirthday] = useState('')
    const [patientPlaceOfBirth, setPatientPlaceOfBirth] = useState('')
    const [patientDomicile, setPatientDomicile] = useState('')
    const [patientEmail, setPatientEmail] = useState('')
    const [patientPhoneNumber, setPatientPhoneNumber] = useState('')
    const [pacientSex,setPacientSex] = useState<Sex>()


    const [rcode, setRCode] = useState('')
    const [patient_Id, setPatient_Id] = useState<Number>(0)
    const [medicC, setMedicC] = useState('')
    const [diagnostic, setDiagnostic] = useState('')
    const [description, setDescription] = useState<string | undefined>(undefined)
    const [cas_Code, setCas_Code] = useState('')
    const [cas_Number, setCas_Number] = useState('')
    const [cas_Date, setCas_Date] = useState('')
    const [cas_Diagnostic, setCas_Diagnostic] = useState('')

    const [invList, setInvList] = useState<Investigations[]>([])
    
    const [reqInvList, setReqInvList] = useState<ReqInvestigations[]>([])
    const [uniqueInv, setUniqueInv] = useState<ReqInvestigations[]>([])
    const [uniqueRef, setUniqueRef] = useState<RefResults[]>([])
    const [domainsId, setDomainsId] = useState<Domain[]>([])
    // const doman = new Set(reqInvList.map(x => x.investigation.machines.domains.id))
    // console.log(doman)
    
    const [result, setResult] = useState<Record<number, string>>({})
    const [resultInvId,setResultInvId] = useState<number[]>([])
    const [machineId,setMachineId] = useState<number>(0)


    const [openPopUpAddPacient,setOpenPopUpAddPacient] = useState(false)
    const [addInvestigations, setAddInvestigations] = useState(false)
    const [openReqDetails, setOpenReqdetails] = useState(true)
    const [requestLoaded,setRequestLoaded] = useState(false)

    const [aModify,setAModify] = useState(false)
    const [resultModify,setResultModify] = useState<AddResult[]>([])

    const [sent, setSent] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [patientLoaded, setPatientLoaded] = useState(false)

    const [loadedMachines,setLoadedMachines] = useState(false)
    const [newMachineId, setNewMachineId] = useState('')
    const [machinesList, setMachinesList] = useState<MachinesList[]>([])

    const [medicalReports, setMedicalReports] = useState<MedicalReports[]>([])

    // setMedicalReports()


    // const [investigations, setInvestigations] = useState(false)
    

    /*****************************************useEffect****************************************************************/
    useEffect(() => {
        if(!id) return;
        (async () => {
            try{
                const { data } = await api.get(`api/v1/lab_requests/${id}`)
                // console.log(data.data.patient_id)
                fetchPrintable()
                fetchRegisteredInv()
                setOpenReqdetails(false)
                searchP(data.data.patient_id)
                setRequestLoaded(true)
                setDescription(data.data.description)
                setDiagnostic(data.data.diagnostic)
                setMedicC(data.data.medic)
                setRCode(data.data.rcode)
                setSent(data.data.sent)
                setCas_Code(data.data.cas_code)
                setCas_Number(data.data.cas_number)
                setCas_Date(data.data.cas_date)
                setCas_Diagnostic(data.data.cas_diagnostic)
                setLoaded(true)


            } catch (e: any) {
                if (e?.response?.status === 401) return navigate("/login", { replace: true });
                if(e?.response?.status === 404) return navigate("/analyse" , { replace: true })
                // const msg = e?.response?.data?.message || e?.message || "Nu s-a putut incarca cererea.";
                // setError(Array.isArray(msg) ? msg.join(", ") : msg);
            } finally {
                setLoading(false);
            }
        })()

    }, [id, navigate])

    useEffect(() => {

        const uniqueDomains= Array.from(
            new Map(
                reqInvList.map(w =>[
                    w.investigation.machines.domains.id,
                    w.investigation.machines.domains.name
                ])
            )
        ).map(([id, name]) => ({ id, name }))
        setDomainsId(uniqueDomains)

        const uniqueInvestigations = Array.from(
            new Map(reqInvList.map(w=> [
                w.investigation_id ,
                w] as const
            )).values()
        )

        setUniqueInv(uniqueInvestigations)


        const uniqueRefs = Array.from(
            new Map(
                reqInvList.filter(r => r.ref_id !== null && r.ref.name !== null ).map(w => [
                    w.ref_id,
                    {investigation_id: w.investigation_id , ref: w.ref.name ?? "" , um: w.ref.um ?? "" ,  result: w.result, normal_values: {min: w.normal_values?.min , max: w.normal_values?.max}}
                ] as const)
                .filter(([, v]) => v.ref !== "")
            ).values())
        setUniqueRef(uniqueRefs)


    }, [reqInvList])
    

/*****************************************Create Request****************************************************************/

    async function handleCreateRequest() {
        setLoading(true)
        setError(null)
        setSubmitting(true)

        const payload = {
            patient_id: patient_Id,
            medic: medicC,
            diagnostic: diagnostic,
            description: description,
            cas_code: cas_Code,
            cas_number: cas_Number,
            cas_date: cas_Date,
            cas_diagnostic: cas_Diagnostic
        }

        if(diagnostic === '' && medicC === '') {
            alert('Campurile de medic si diagnostic trebuiesc completate!!')
        }
        // console.log(payload)

        if(id) {
            // console.log('Salvat!')
            return
        }

        if(!id) {
            try {
                const { data } = await api.post('api/v1/lab_requests', payload)
                setLoaded(true)
                navigate(`/analyse/${data.data.id}`, {replace: true})

            } catch(e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la creearea unei cereri')
            } finally { 
                setLoading(false)
                setSubmitting(false)
            }
            return
         }
    }
/*****************************************Send TO LAB****************************************************************/
    async function handleSendToLab() {
    const conf = confirm ("Sunteti sigur ca vreti sa trimiteti cererea catre laborator?")
        if(conf) {
            try {
                const { data } = await api.post(`api/v1/lab_requests/send/${id}`)
                setSent(true)

            } catch(e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la creearea unei cereri')
            }
        }
    }

/*****************************************searchP****************************************************************/



    async function searchP(patient_Id: number) {
        setLoading(true)
        

        try {
            const { data } = await api.get('api/v1/patients/analyse/request',{ params: { patient_Id: patient_Id } })
            
            if(data.data === null) setOpenPopUpAddPacient(true)
            setPatient_Id(data.data.id)
            setPatientFirstName(data.data.first_name)
            setPatientLastName(data.data.last_name)
            setPatientCNP(data.data.cnp)
            setPatientLoaded(true)
            // console.log(data.data)
        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la cautare')
        } finally{
            setLoading(false)
        }
    }

    /********************************Investigations************************************************************************* */
    
    async function fetchInvestigations() {
        // console.log('helo')
        try {
            // console.log('incearca')
            const { data } = await api.get<Investigations[]>('api/v1/lab_requests/get/investigations')
            const selectedInv = new Set(reqInvList.map(x => x.investigation.id))
            // console.log(selectedInv)
            const items = data.map(item =>({...item, selected: selectedInv.has(item.id) ? true : false }))
            setInvList(items)
            // console.log(items)

        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la incarcarea investigatiilor')
        } 
    }



    async function fetchRegisteredInv() {

        try {
            const { data } = await api.get(`api/v1/lab_requests/get/insert/investigations/${id}`)
            setReqInvList(data)


        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la listarea investigatiilor')
        }

    }


    async function insertInv() {
        setAddInvestigations(false)
        const items = invList.filter(f => f.selected === true).map(m => m.id)

        const temp = new Set(reqInvList.map(m => m.investigation.id))
        // console.log(temp)

        // console.log(temp) 
        const insertedInv = invList.filter(w => w.selected === false && temp.has(w.id)).map(m => m.id)
        console.log(insertedInv)
        
        if(insertedInv.length > 0) {
            try {
                const { data } = await api.post(`api/v1/lab_requests/delete/inserted/investigations/${id}`, insertedInv)
                // console.log(insertedInv)

            } catch(e: any) {
                if(e?.response?.status === 400) return alert("Nu poti scoate o investigatie care are rezultat/este validata!");
                
            }
        }

        const payload = {
            request_id: id,
            investigation_id: items,
        }
        
        if(items.length > 0) {
            try {
                const { data } = await api.post('api/v1/lab_requests/insert/investigations', payload)
                // console.log(data)

            } catch(e: any) {
                if(e?.response?.status === 400) return alert("Nu au fost gasite investigatiile")
            }
        }

        
        fetchRegisteredInv()
    }


    /********************************Patients************************************************************************* */


    async function searchPatient() {
        setLoading(true)
        // if(id) return console.log('mue')

        try {
            const { data } = await api.get('api/v1/patients/request',{ params: { cnp: patientCNP } })
            setSent(false)
            if(data.data === null) {
                const tempSex: Sex = patientCNP[0] === '5' || patientCNP[0] ===  '1' ? 'MALE' : 'FEMALE' 
                
                setPacientSex(tempSex)
                return setOpenPopUpAddPacient(true)
            }
            setPatient_Id(data.data.id)
            setPatientFirstName(data.data.first_name)
            setPatientLastName(data.data.last_name)
            setPatientCNP(data.data.cnp)
            setPatientLoaded(true)
            // console.log(data.data)
        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la cautare')
        } finally{
            setLoading(false)
        }
    }



    async function handleCreatePatient(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const date = toISO(patientBirthday)
        if(date === null) return setError('Nu a fost setata data nasterii corect!! ZIUA/LUNA/ANUL')
        const payload = {
            first_name: patientFirstName,
            last_name: patientLastName,
            cnp: patientCNP,
            date_of_birth: date,
            place_of_birth: patientPlaceOfBirth,
            phone_number: patientPhoneNumber,
            email: patientEmail,
            domicile: patientDomicile,
            sex: pacientSex
        }
        console.log(payload)
        try {
            const { data } = await api.post('api/v1/patients', payload)
            console.log(data)

        } catch(e: any){
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la crearea unui pacient')
        } finally {
            setLoading(false)
        }
        setOpenPopUpAddPacient(false)
    }

    /********************************Date Format************************************************************************* */


    function formatDate(r: string): string {
        const digits = r.replace(/\D/g, '').slice(0, 8)

        const dd = digits.slice(0, 2)
        const mm = digits.slice(2, 4)
        const yyyy = digits.slice(4, 8)

        if(digits.length <= 2) return dd
        if(digits.length <= 4) return `${dd}/${mm}`

        return `${dd}/${mm}/${yyyy}`
    }


    function toISO(i: string): string | null {
        const s = i.trim()

        const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

        if(!m) return null

        const day = Number(m[1])
        const month = Number(m[2])
        const year = Number(m[3])

        const d = new Date(year, month - 1, day, 12 , 0 , 0)
        if(d.getFullYear()  !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null

        return d.toISOString()

    }


    /*****************************************modify result****************************************************************/

    async function modifyResults (aId: number[]) {
        // console.log(aId)
        const temp = new Set(aId)
        const t = uniqueInv.some(w => temp.has(w.investigation_id) && w.validated === true)
        
        if(t) {
            return alert("Pentru a introduce un rezultat, investigatia trebuie devalidata!!!!")
        }

        setResult({})
        try{
            const { data }= await api.post<AddResult[]>('api/v1/lab_requests/getRefs' , {ids: aId} )
            setResultModify(data)
  
            reqInvList.filter(r => r.ref_id !== null && r.ref.name !==null).map(w => setResult(prev => ({...prev, [Number(w.ref_id)]: w.result})))
            fetchRegisteredInv()
            const filteredInv = data.filter(w => w.investigation_id)
        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Eroare la listarea refurilor")
        }
        
        setAModify(true)
        setResultInvId(aId)
        setMachineId(machineId)


        // console.log(payload)
    }



    async function handleSaveResults (id_inv: number ,id_ref: number, id_machine: number, result: string) {

        const payload = {
            request_id: Number(id),
            machine_id: id_machine,
            investigation_id: id_inv,
            ref_id: id_ref,
            result: result
        }

        // console.log(payload)
        try {
            const { data } = await api.patch('api/v1/lab_requests/save/results', payload)

            fetchRegisteredInv()
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Eroare la salvarea rezultatelor")
        }

    }

    /********************************VALIDATION************************************************************************* */

    async function validateInv(ids: number[]) {
        const payload = {
            request_id: id,
            ids: ids
        }
        const t = new Set(ids)
        const rez = reqInvList.some(w => t.has(w.investigation_id) && w.validated === false)
        // console.log(test)
        const rezultat = confirm(rez ?  "Esti sigur ca vrei sa validezi?" : "Esti sigur ca vrei sa devalidezi?")
        if(rezultat) {
            try {
                const { data } = await api.patch('api/v1/lab_requests/validate/investigations', payload)
                fetchRegisteredInv()
            } catch(e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? "Eroare la validare")
            }
        }

    }

    /*********************************Delete results****************************************************************************** */

    async function deleteResults(ids: number[]) {
        const temp = new Set(ids)
        const t = uniqueInv.some(w => temp.has(w.investigation_id) && w.validated === true)
        
        if(t) {
            return alert("Pentru a sterge un rezultat, investigatia trebuie devalidata!!!!")
        }

        const payload = {
            request_id: id,
            ids: ids
        }

        // console.log(test)
        const rezultat = confirm("Esti sigur ca vrei sa stergi rezultatul?")

        if(rezultat) {
            try{
                const { data } = await api.patch('api/v1/lab_requests/delete/results', payload)
                fetchRegisteredInv()
            } catch(e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? "Eroare la stergerea rezultatelor")
            }
        }

    }

    /********************************fetch machines************************************************************************* */

    async function fetchMachines(investigation_id: number,name: string){


        const payload = {
            investigation_id: investigation_id,
            name: name
        }
        try{
            const { data } = await api.post('api/v1/lab_requests/get/machines/inv', payload)

            setMachinesList(data)

        } catch(e:any) {
        }
    }

    async function saveMachines(invId: string, currentInv: number) {
        const ok = confirm("Esti sigur ca vrei sa schimbi aparatul?")


        if(ok) {
            try {
                const { data } = await api.post(`api/v1/lab_requests/save/new/machine/${invId}/${id}/${currentInv}`)
                // fetchRegisteredInv()

            } catch(e:any) {
                // setError(e?.response?.data?.message ?? e?.message ?? "Eroare la listarea aparatelor")
                if (e?.response?.status === 400) return alert("Investigatia este valdiata/are rezultat!");
        
            }
        }

    }
    /*****************************************fetch printable****************************************************************/

    async function fetchPrintable(){

        try{
            const { data } = await api.get<ListResponseMedicalReports>('api/v1/lab_requests/get/all/printable')
            console.log(data.data)
            setMedicalReports(data.data)

        } catch(e:any) {
        }
    }


    /********************************page************************************************************************* */

   

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
            <div className="text-right px-6 py-4 bg-slate-950/80 backdrop-blur border-b border-slate-800 text-xl uppercase tracking-wide text-slate-300">
                <span className="text-slate-400">Codul cererii:</span>{" "}
                <span className="text-slate-100 font-semibold">{rcode}</span>
            </div>

                    {/** Sectiunmea Pacientului */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3"><h1 className="text-3xl font-semibold text-slate-100">Cerere Investigatii</h1></div>
                {/* <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}> */}
                        
                        {patientLoaded ? 
                        
                        <div className="p-2 text-emerald-300 text-3xl font-bold">{patientFirstName} {patientLastName}[{patientCNP}]</div>

                        :
                        <div>
                            <input
                                type="text"
                                min={1}
                                value={patientFirstName}
                                onChange={(e) => setPatientFirstName(e.target.value)}
                                placeholder="Numele de familie"
                                disabled={patientLoaded}
                                className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            <input
                                type="text"
                                min={1}
                                value={patientLastName}
                                onChange={(e) => setPatientLastName(e.target.value)}
                                placeholder="Prenumele"
                                disabled={patientLoaded}
                                className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            <input
                                value={patientCNP}
                                onChange={(e) => setPatientCNP(e.target.value)}
                                placeholder="CNP PACIENT"
                                disabled={patientLoaded}
                                className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            /> <button onClick={() => searchPatient()} className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30">Cauta pacient</button>
                        </div>}


                        





                            <br />  <br />

                        {/* Sectiunea de detalii cerere */}

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                        <h2 className="text-base font-semibold text-slate-100 mb-3">Detalii cerere</h2>
                        {openReqDetails ?       
                         <div className="align-middle justify-center">
                            <input
                                className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                type="text"
                                value={medicC}
                                onChange={(e) => setMedicC(e.target.value)}
                                placeholder="Medicul curant"
                            />    
                            
                            <input
                                className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                type="text"
                                value={diagnostic}
                                onChange={(e) => setDiagnostic(e.target.value)}
                                placeholder="Diagnosticul pacientului"
                            />
                            <input
                                className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                type="text"
                                value={cas_Code}
                                onChange={(e) => setCas_Code(e.target.value)}
                                placeholder="Codul CAS"
                            />
                            <input
                                className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                type="text"
                                value={cas_Number}
                                onChange={(e) => setCas_Number(e.target.value)}
                                placeholder="Numarul biletului"
                            />
                            {/*DE REVIZUIT DATA*********************************/}
                            <input
                                className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                type="text"
                                value={cas_Date}
                                onChange={(e) => setCas_Date(e.target.value)}
                                placeholder="Data biletului de trimitere"
                            />
                            <input
                                className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                type="text"
                                value={cas_Diagnostic}
                                onChange={(e) => setCas_Diagnostic(e.target.value)}
                                placeholder="Diagnosticul CAS"
                            />

                            <textarea 
                                className="min-h-[56px] max-h-32 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Descriere"
                            ></textarea>
                        </div>
                        : <div onClick={() => setOpenReqdetails(true)} className="text-sm text-slate-300 hover:text-slate-100 underline underline-offset-4 cursor-pointer p-2">Afiseaza detaliile cererii</div>
                        }
                        </div>

        </section>

        {sent &&
        <section  className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">
            <div className="flex gap-4 flex-wrap">
                {medicalReports?.map(w => (
                    <Link to={`${w.link}${id}`} className="flex items-center gap-2 text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">
                        <Printer/>{w.name}
                    </Link>

                ))}
            </div>
        </section>}


       
        {/** Sectiunea de analize */}
        {requestLoaded && <section className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-4">

            <button className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium border border-slate-700 hover:bg-blue-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" onClick={() => {
                setAddInvestigations(true)
                fetchInvestigations()
                }}>Adauga investigatii</button>


            {domainsId.map(w => (
                <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 ">
                <div className="">
                    <div className="float-left">
                        <h2 className=" text-red-500 text-3xl font-semibold px-2 py-1">{w.name}</h2>
                    </div>  

                    {sent &&                
                    <div className="float-right mr-5 mb-3">
                        <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30" onClick={() => deleteResults(uniqueInv.filter(r => r.investigation.machines.domains.id === w.id).map(w => w.investigation.id))}><Trash2 /></button>
                        <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30" onClick={() => modifyResults(uniqueInv.filter(r => r.investigation.machines.domains.id === w.id).map(r => r.investigation.id))}><NotebookPen /></button>
                        <button className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30  ${uniqueInv.filter(r => r.investigation.machines.domains.id === w.id).every(w => w.validated === true) ? 'bg-emerald-500/15 text-emerald-300 border-emerald-700/40' : 'bg-slate-900 text-slate-200 border-slate-700'} `} onClick={() => validateInv(uniqueInv.filter(r => r.investigation.machines.domains.id === w.id).map(w => w.investigation.id))}>{uniqueInv.filter(r => r.investigation.machines.domains.id === w.id).every(w => w.validated === true)   ? <Check /> :  <X /> }</button>                 
                    </div>  }         
                </div>

                <table className="w-full table-fixed border border-slate-800 rounded-xl overflow-hidden">
                <tbody className="divide-y divide-slate-800">
                {uniqueInv.map((tx) => {
                    if(w.id !== tx.investigation.machines.domains.id) return null
                    
                    
                    return (
                    <Fragment key={`tx-${tx.id}`}>
                    <tr  className="bg-transparent hover:bg-slate-900/40">
                    <td className="p-2 text-left text-slate-100 font-bold text-lg truncate w-1/6" >{tx.investigation.name}</td>
                    
                    <td className="p-2 w-4/6" >
                        <div className="flex justify-end">

                        </div>
                    </td>
                     { sent &&
                    <td className="p-2 z-50 w-1/6">
                        <div className="flex justify-end gap-2">
                            <select key={`machine-${tx.id}`} onFocus={() => fetchMachines(tx.investigation_id,tx.investigation.name)} onChange={(e) => saveMachines(e.target.value , tx.investigation_id)} className="h-9 w-56 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                                <option value={`${tx.investigation.machines.id}`}>{tx.investigation.machines.name}</option>
                                {machinesList.map(machine => (
                                <option value={`${machine.id}`}>{machine.machines.name}</option>
                                ))}
                                
                            </select>
                            
                            <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30" onClick={() => deleteResults([tx.investigation.id])}><Trash2 /></button>
                            <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30" onClick={() => modifyResults([tx.investigation.id])}><NotebookPen /></button>
                            <button className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${tx.validated ? 'bg-emerald-500/15 text-emerald-300 border-emerald-700/40' : 'bg-slate-900 text-slate-200 border-slate-700'} `} onClick={() => validateInv([tx.investigation.id])}>{tx.validated ?   <Check /> : <X />}</button>
                            
                        </div>
                    </td>
                    }

                    </tr>

                    
                    {uniqueRef.map((u) => 
                        (u.investigation_id === tx.investigation_id ? (
                            <tr key={`ref-${tx.id}-${u.ref}`} className="bg-transparent hover:bg-slate-900/40">
                                <td className="truncate p-2 w-1/6 border-0">{u.ref}</td>
                                <td className="p-2 w-4/6  flex items-center gap-2">
                                    <span className="whitespace-pre-wrap break-words min-w-0">
                                        {u.result}
                                    </span>
                                    {!isNaN(Number(u.result)) && (
                                        <>
                                            {Number(u.result) > Number(u.normal_values?.max) && (
                                                <ArrowUpRight className="text-red-600 shrink-0"/>
                                            )}

                                            {Number(u.result) < Number(u.normal_values?.min) && (
                                                <ArrowDownRight className="text-red-600 shrink-0"/>
                                            )}
                                        </>
                                    )}
                                    {/* <ArrowDownRight className="text-red-600 shrink-0"/>
                                    <ArrowUpRight className="text-green-600 shrink-0"/> */}
                                    </td>
                                {u.normal_values?.min || u.normal_values?.max ? 
                                <td className="p-2 w-1/6 truncate border-0">{u.normal_values?.min} - {u.normal_values?.max}   {u.um}</td> 
                              : <td></td>}           
                            </tr>
                        ) : null
                        ))}
                    </Fragment>
                    )
                    
                })}
                </tbody>
                </table>
                
                </section>
            ))        
            }
        </section>}



        {openPopUpAddPacient && (
            <div
                onClick={() => setOpenPopUpAddPacient(false)}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <div
                onClick={(e) => e.stopPropagation()}
                className="w-[min(1200px,95vw)] h-[min(700px,90vh)] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl p-6 overflow-auto flex flex-col gap-4"

                >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-100">Adauga un pacient</h3>
                    <button type="button" onClick={() => setOpenPopUpAddPacient(false)} className="">
                    Inchide X
                    </button>
                </div>

                <form
                    onSubmit={handleCreatePatient}
                    className="grid grid-cols-6 gap-2"
                >
                    <input
                        type="text"
                        min={3}
                        value={patientFirstName}
                        onChange={(e) => setPatientFirstName(e.target.value)}
                        placeholder="Numele de familie"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                    />
                    <input
                        type="text"
                        min={3}
                        value={patientLastName}
                        onChange={(e) => setPatientLastName(e.target.value)}
                        placeholder="Prenumele"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                    />
                    <input
                        value={patientCNP}
                        onChange={(e) => setPatientCNP(e.target.value)}
                        placeholder="CNP PACIENT"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <select value={pacientSex} onChange={(e) => setPacientSex(e.target.value as Sex) } className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        <option value="MALE">Barbat</option>
                        <option value="FEMALE">Femeie</option>
                    </select>

                    <input
                        type="text"
                        value={patientBirthday}
                        onChange={(e) => setPatientBirthday(formatDate(e.target.value))}
                        placeholder="Data nasterii(ZIUA/LUNA/ANUL)"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                    />    
                    

                    <input
                        type="text"
                        value={patientPlaceOfBirth}
                        onChange={(e) => setPatientPlaceOfBirth(e.target.value)}
                        placeholder="Locul Nasterii"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                    />
                    <input
                        type="text"
                        value={patientDomicile}
                        onChange={(e) => setPatientDomicile(e.target.value)}
                        placeholder="Domiciliul"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      
                    />
                    <input
                        type="text"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="Email"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                    />

                    <input
                        type="text"
                        value={patientPhoneNumber}
                        onChange={(e) => setPatientPhoneNumber(e.target.value)}
                        placeholder="Telefon"
                        className="h-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

                    />

                    

                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>

                    <button className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30" type="submit">Salveaza pacientul</button>

                    </div>
                </form>
                </div>
            </div>
        )}
        {addInvestigations && (
            <div
                onClick={() => 
                    insertInv
                    
                }
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <div
                onClick={(e) => e.stopPropagation()} // nu închide când dai click în cutie
                className="w-[min(1200px,95vw)] h-[min(700px,90vh)] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl p-6 overflow-auto flex flex-col gap-4"

                >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-100">Adauga investigatii</h3>
                    <button className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30" type="submit"  onClick={insertInv}>
                    Inchide X
                    </button>
                </div>


                     {invList.map(i => (
                        <label
                            key={i.id}
                            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/40"
                            >
                            
                            <input
                             type="checkbox"
                             checked={i.selected}
                             onChange={(e) => setInvList(prev =>
                                prev.map(p => 
                                    p.id === i.id ? {...p, selected: e.target.checked} : p
                                )
                             )}
                             className="h-4 w-4 accent-emerald-500"

                            />
                            {i.name}
                        </label>
                     ))}

                </div>
            </div>
        )}





        {aModify && (
            <div
                onClick={() => 
                    setAModify(false)
                    
                }
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"

            >
                <div
                    onClick={(e) => e.stopPropagation()} // nu închide când dai click în cutie
                    className="w-[min(1200px,95vw)] h-[min(700px,90vh)] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl p-6 overflow-auto flex flex-col gap-4"

                >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Adauga investigatii</h3>
                    <button className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30" type="submit"  onClick={() => (setAModify(false))}>
                    Inchide X
                    </button>
                </div>
                {
                    resultModify.map((tx) => (
                        <div key={tx.id} className="p-2 flex flex-col">
                        
                            <div>{tx.name}</div>

                            <div className="flex items-start gap-4">
                                {tx.active && tx.type === 'TEXT' ?
                                
                                <textarea key={tx.id} className="min-h-[56px] max-h-32 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y" value={result[tx.id] ?? ""}  onChange={(e) => setResult(prev => ({...prev, [tx.id]: e.target.value}))} />

                                : <input key={tx.id} className="h-10 w-full max-w-32 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" value={result[tx.id]} onChange={(e) => setResult(prev => ({...prev, [tx.id]: e.target.value}))} />}
                                <button className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30" onClick={() => handleSaveResults(tx.investigation_id, tx.id , tx.investigation.machinesId , result[tx.id])}>Salveaza</button>
                            </div>
                        </div>
                    ))
                }

                </div>
            </div>
        )}


        <div className="sticky bottom-0 z-40 border-t border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-3 flex justify-center">
        {loaded === false ? 
            <button onClick={handleCreateRequest} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">Salveaza</button>
                :
            sent === false &&
                <button onClick={handleSendToLab} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">Laborator</button>
                
        }
        </div>
        </div>
    )
}