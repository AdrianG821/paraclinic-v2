import { useState , useEffect} from "react"
import api from "../api/axios"
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Domains from "./Domains";
import { Fragment } from "react";
import { ArrowDownRight, ArrowUpRight} from "lucide-react";
import "./print.css"


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
    validatedId: number
    validatedName: {roles: string[] , name: string}
    validated_date: string
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


type MachinesList = {
    id: number
    machines: {name: string}
}

type Sex = 'MALE' | 'FEMALE'


export default function Medical_Report() {

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

    const [invList, setInvList] = useState<Investigations[]>([])
    
    const [reqInvList, setReqInvList] = useState<ReqInvestigations[]>([])
    const [uniqueInv, setUniqueInv] = useState<ReqInvestigations[]>([])
    const [uniqueRef, setUniqueRef] = useState<RefResults[]>([])
    const [domainsId, setDomainsId] = useState<Domain[]>([])
    // const doman = new Set(reqInvList.map(x => x.investigation.machines.domains.id))
    // console.log(doman)
    
    const [antetStanga, setAntetStanga] = useState('Laboratorul de analize medicale')
    const [titlu, setTitlu] = useState('BULETIN DE INVESTIGATII')
    const [textInformativ, setTextInformativ] = useState('Reproducerea buletinului este strict interzisa fara aprobarea laboratorului')
    const [codificare, setCodificare] = useState('PG-F0-04 din 01.05.2023')
    const [siglaRenar, setSiglaRenar] = useState('')



    const [openPopUpAddPacient,setOpenPopUpAddPacient] = useState(false)
    const [addInvestigations, setAddInvestigations] = useState(false)
    const [openReqDetails, setOpenReqdetails] = useState(true)
    const [requestLoaded,setRequestLoaded] = useState(false)

    const [aModify,setAModify] = useState(false)


    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [patientLoaded, setPatientLoaded] = useState(false)

    const [loadedMachines,setLoadedMachines] = useState(false)
    const [newMachineId, setNewMachineId] = useState('')
    const [machinesList, setMachinesList] = useState<MachinesList[]>([])


    // const [investigations, setInvestigations] = useState(false)
    

    /*****************************************useEffect****************************************************************/
    useEffect(() => {
        if(!id) return;
        (async () => {
            try{
                const { data } = await api.get(`api/v1/lab_requests/${id}`)
                // console.log(data.data.patient_id)
                fetchRegisteredInv()
                setOpenReqdetails(false)
                searchP(data.data.patient_id)
                setRequestLoaded(true)
                setDescription(data.data.description)
                setDiagnostic(data.data.diagnostic)
                setMedicC(data.data.medic)
                setRCode(data.data.rcode)


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
        const onlyValidated = reqInvList.filter(w => w.validated === true && w.result !== null)

        const uniqueDomains= Array.from(
            new Map(
                onlyValidated.map(w =>[
                    w.investigation.machines.domains.id,
                    w.investigation.machines.domains.name
                ])
            )
        ).map(([id, name]) => ({ id, name }))
        setDomainsId(uniqueDomains)

        const uniqueInvestigations = Array.from(
            new Map(onlyValidated.map(w=> [
                w.investigation_id ,
                w] as const
            )).values()
        )

        setUniqueInv(uniqueInvestigations)
        


        const uniqueRefs = Array.from(
            new Map(
                onlyValidated.filter(r => r.ref_id !== null && r.ref.name !== null ).map(w => [
                    w.ref_id,
                    {investigation_id: w.investigation_id , ref: w.ref.name ?? "" , um: w.ref.um ?? "" , result: w.result, normal_values: {min: w.normal_values?.min , max: w.normal_values?.max}}
                ] as const)
                .filter(([, v]) => v.ref !== "")
            ).values())
        setUniqueRef(uniqueRefs)


    }, [reqInvList])
    



    async function searchP(patient_Id: number) {
        setLoading(true)

        try {
            const { data } = await api.get('api/v1/patients/analyse/request',{ params: { patient_Id: patient_Id } })
            console.log(data.data)
            if(data.data === null) setOpenPopUpAddPacient(true)
            setPatient_Id(data.data.id)
            setPatientFirstName(data.data.first_name)
            setPatientLastName(data.data.last_name)
            setPatientCNP(data.data.cnp)
            setPatientBirthday(new Date(data.data.date_of_birth).toLocaleDateString('ro-RO'))
            setPatientDomicile(data.data.domicile)
            setPatientEmail(data.data.email)
            setPacientSex(data.data.sex)
            setPatientPhoneNumber(data.data.phone_number)
            setPatientLoaded( true)
        
            // console.log(data.data)
        } catch(e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la cautare')
        } finally{
            setLoading(false)
        }
    }

    /********************************Investigations************************************************************************* */



    async function fetchRegisteredInv() {

        try {
            const { data } = await api.get(`api/v1/lab_requests/get/insert/investigations/validated/${id}`)
            setReqInvList(data)


        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Eroare la listarea investigatiilor')
        }

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



    /********************************page************************************************************************* */

   

    return (

    <div className="min-h-screen bg-white text-black px-6 py-10 print:p-0">
        <div className="mx-auto w-full print:max-w-[210mm] bg-white text-black">

                <div className="grid">
                    <div className="flex justify-between">
                        <div className="">{antetStanga}</div>
                        <div className="wrap flex  text-3xl text-red-700 font-medium justify-end">Codul cererii: {rcode}</div>
                        
                    </div>
                            {/** Sectiunmea Pacientului */}
                <section className="">
                    <h1 className="p-5 text-red-700 font-bold text-4xl  text-center">{titlu}</h1>
                                
                            
                                <div className="p-2 text-xl border-2 border-black font-bold grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <div className="p-2">Numele pacientului: {patientFirstName} {patientLastName}</div> 
                                    <div className="p-2">Sexul: {pacientSex === 'MALE' ? "Masculin" : "Feminin"}</div>
                                    <div className="p-2">CNP: {patientCNP}</div>
                                    <div className="p-2">Data nasterii: {patientBirthday}</div> 
                                    <div className="p-2">Domiciliul: {patientDomicile}</div>
                                    <div className="p-2">Email: {patientEmail}</div>
                                    <div className="p-2">Telefon: {patientPhoneNumber}</div> 
                                    <div className="p-2">Diagnostic: {diagnostic}</div> 
                                    <div className="p-2">Medic curant: {medicC}</div>                    
                                </div>


                </section>

                
                <br />           <br />



                {/** Sectiunea de analize */}
                {requestLoaded && <section className="border-2 border-black">




                    {domainsId.map(w => (
                        <section className="grid ">
                        <div className="bg-gray-300">
                            <div className="float-left ">
                                <h2 className="text-2xl text-black font-medium p-1">{w.name}</h2>
                            </div>                           
                        </div>                      

                        <table className="w-full table-fixed border-solid border-black border-5 ">
                            <thead>
                                <tr>
                                    <th>Numele invesigatiei:</th>
                                    <th>Valoarea</th>
                                    <th>Valoarea normala</th>
                                </tr>
                            </thead>
                        <tbody>
                        {uniqueInv.map((tx) => {
                            if(w.id !== tx.investigation.machines.domains.id) return null
                            
                            
                            return (
                            <Fragment key={`tx-${tx.id}`}>

                            <tr  className="border-black border-2 ">
                            <td className="p-2 text-left text-red-500 font-bold text-lg truncate " >{tx.investigation.name} (Aparat: {tx.investigation.machines.name})</td>
                            
                            <td className="p-2 text-left text-red-500 font-bold text-lg truncate ">
                                Validata de {tx?.validatedName?.roles?.[0] ?? ""} {tx.validatedName.name} la {new Date(tx.validated_date).toLocaleDateString("ro-RO")}
                            </td>


                            

                            </tr>

                            
                            {uniqueRef.map((u) => 
                                (u.investigation_id === tx.investigation_id ? (
                                    <tr key={`ref-${tx.id}-${u.ref}`} className="border-black border-2 ">
                                        <td className="truncate p-2 w-1/6 border-black border-2">{u.ref}</td>
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
                                            </td>
                                        {u.normal_values?.min || u.normal_values?.max ? 
                                        <td className="p-2 w-1/6 truncate border-black border-2">{u.normal_values?.min} - {u.normal_values?.max} {u.um}</td> 
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
                <div className="p-2 flex justify-between">
                    <div>{textInformativ}</div>
                    <div>{codificare}</div>
                </div>


        
                </div>
            </div>
        </div>
    )
}