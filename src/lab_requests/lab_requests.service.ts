import { Injectable } from '@nestjs/common'
import { Prisma} from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { NotFoundException, BadRequestException , InternalServerErrorException } from '@nestjs/common'
import { not } from 'rxjs/internal/util/not'
import { isArray, validate } from 'class-validator'
import { ref } from 'node:process'

type CreateRequest = {
    patient_id: number,
    requested_id: number,
    medic: string,
    diagnostic: string,
    payment_type?: number,
    description?: string,
    cas_code?: string,
    cas_number?: string,
    cas_date?: string,
    cas_diagnostic?: string
}

type Insert_Inv = {
    request_id: number,
    investigation_id: number[],
}

type PatchResults = {
    request_id: number,
    investigation_id: number,
    machine_id: number,
    ref_id: number,
    result: string
}




//functia care parseaza ultimul cod venit din baza de date
function parseRequestCode(code: string): { prefix: string, num: number } {
    const m = code.match(/^([A-Z]{2})(\d{4})$/)

    if(!m) throw new InternalServerErrorException(`Codul de cerere este invalid in db: ${code}`)

    return { prefix: m[1], num: Number(m[2]) }
}

function nextPrefix(prefix: string): string {
    //Luam literele si le facem in numarul lor ASCII
    const a = prefix.charCodeAt(0) - 65
    const b = prefix.charCodeAt(1) - 65

    // avem catul + baza + restul
    const value = a * 26 + b
    const next = value + 1

    if(next >= 26 * 26) throw new InternalServerErrorException('Prefixul a trecut de ZZ')
    //daca avem 149/26 - inseamna 5.73... noi preluam doar 5-ul
    const first = Math.floor(next/26)
    // preluam restul adica 5 x 26 = 130 / 149-130 = 19
    const second = next %26

    return String.fromCharCode(65 + first) + String.fromCharCode(65 + second)
}

function codeRequest(code: string | null): string {
    if(!code) return 'AA1000'

    const {prefix, num} = parseRequestCode(code)
    
    if(num < 9999) {
        const nextNum = num + 1
        return `${prefix}${String(nextNum).padStart(4, '0')}`
    }

    return `${nextPrefix(prefix)}1000`
}


function parseDate(s: string) {
    const m = s.match(/^(\d{2}).(\d{2}).(\d{4})$/)

    if(!m) throw new InternalServerErrorException("Data nasterii posibil gresita!")

    const day = m[1]
    const month = m[2]
    const year = m[3]

    return {day, month , year}
}

@Injectable()
export class Lab_RequestsService {
    constructor(private readonly prisma: PrismaService) {}

    async findRequest(id: number) {
        const order = await this.prisma.prisma.lab_requests.findUnique({
            where: {id},
            select: {
                id: true,
                rcode: true,
                patient_id: true,
                requested_id: true,
                medic: true,
                diagnostic: true,
                payment_type: true,
                description: true,
                deleted_date: true,
                deleted_id: true,
                verified: true,
                verified_id: true,
                createdAt: true,
                sent: true,
                cas_code: true,
                cas_number: true , 
                cas_date: true , 
                cas_diagnostic: true
                
            }
        })
        if(!order) throw new NotFoundException('Nu a fost gasita nicio cerere cu acest id')

        return order
    }

    async create(params: CreateRequest) {
        //in cazul in care vin 2 requesturi in acelasi timp folosim un for, pentru a reincerca generarea cererilor cu cod separat
        const retries = 5
        const { patient_id , requested_id , medic , diagnostic , description , payment_type , cas_code, cas_number , cas_date , cas_diagnostic } = params

        for(let a = 1;a <= retries; a++) {
            try{
                return await this.prisma.prisma.$transaction(async (tx) =>{
                    const lastCode = await tx.lab_requests.findFirst({
                        orderBy: { rcode: 'desc' },
                        select: { rcode: true}
                    })

                    const code = codeRequest(lastCode?.rcode ?? null)
                    
                    return tx.lab_requests.create({
                        data: { rcode: code,  patient_id , requested_id , medic , diagnostic , description , payment_type , sent: false , cas_code, cas_number , cas_date , cas_diagnostic}
                    })
                }, {
                    // baza de date trb sa decida cat de izolata este tranzactia fata de altele(cea mai izolata Serializable)
                    //Serializable = db garanteaza ca restrul tranzactiilor concurente va fi ca si cum ar fi rulat una dupa alta(gen pe rand)
                    //daca avem doua care citesc in acelasi timp ultimul rcode pe una e posibil sa ii dea abort
                     isolationLevel: Prisma.TransactionIsolationLevel.Serializable
                })

            } catch(e: any) {
                //daca primim eroarea P2002 de unique constraint, si mai avem incercari aruncam eroarea e si reincercam 
                if(e?.code === 'P2002' && a < retries) continue
                throw e
            }


        }
    }

    async getInv() {
        const items = await this.prisma.prisma.investigations.findMany({
            select: {id: true,name: true}
        })

        return items
    }


    async insertInv(params: Insert_Inv) {
        const { request_id , investigation_id } = params

        const items = await this.prisma.prisma.investigations.findMany({
            where:{ id: {in: investigation_id} },
            select: { id: true , machinesId: true , name: true }
        })
        if(items.length === 0 ) throw new BadRequestException("Nu au fost gasite investigatiile")

        const exists = await this.prisma.prisma.results.findMany({
            where: { request_id , investigation_id: { in: investigation_id} },
            select: { investigation: { select: {name: true} }}
        })
        const alreadyInserted = new Set(exists.map(w => w.investigation.name))
        const remains = items.filter(r => !alreadyInserted.has(r.name))

        

        return await this.prisma.prisma.results.createMany({
            data: remains.map(tx => ({
                request_id,
                machine_id: tx.machinesId,
                investigation_id: tx.id,
            })),
            // tinem cont de conditia @unique
            skipDuplicates: true
        })

        // console.log(request_id+ "  " + investigation_id)
    }

    async getInsertInv(id: number){

        const exists = await this.prisma.prisma.lab_requests.findFirst({
            where: { id },
            select: { id: true , patient_id: true , pacient: { select: { date_of_birth: true , cnp: true , sex: true } } , createdAt: true }
        })
        
        if(!exists) throw new NotFoundException("Nu a fost gasita cererea")


        let items = await this.prisma.prisma.results.findMany({
            where: {request_id: id},
            select: { id: true, request_id: true, investigation_id: true ,ref_id: true, ref: { select: {name: true , um: true} } ,  investigation: {select:{id: true , name: true , machines: {select: { id: true ,name: true , domains: { select: { id: true , name: true }} }}}} , result: true , validated: true }
        })

        // console.log(items)
        const uniqueRefIds = Array.from(
            new Set(
                items
                .map(w => w.ref_id)
                .filter((id): id is number => id !== null)))

    
        //temporar pana aduc in baza de date sexul pacientului $@#!@!#@!#@QER!@#R!@#$%!@$%!@(SUNT IDIOT)

        const patientSex = exists.pacient.sex

        const patientAgeConverted = exists.pacient.date_of_birth
        const requestedDateConverted = exists.createdAt
 

        const result = await this.prisma.prisma.$queryRaw<{ age: number; months: number ; days: number }[]>`
        SELECT 
               EXTRACT(YEAR   FROM AGE(${requestedDateConverted}::date, ${patientAgeConverted}::date))::int AS age,
               EXTRACT(MONTH  FROM AGE(${requestedDateConverted}::date, ${patientAgeConverted}::date))::int  AS months,
               EXTRACT(DAY    FROM AGE(${requestedDateConverted}::date, ${patientAgeConverted}::date))::int  AS days
        `

        const years = result[0].age ?? 0
        const months = result[0].months ?? 0
        const days = result[0].days ?? 0


        const calculatedMonths = months + 12 * years
        const calculatedDays = days + months * 30 + years * 365

        if(uniqueRefIds.length === 0) return items

        const normal_values = await this.prisma.prisma.normal_values.findMany({
            where: { ref_id: { in: uniqueRefIds } , sex: patientSex},
            select: { ref_id: true , um: true, age_from: true , age_to: true, min: true , max: true }
        })


        const matchedDays = normal_values.filter(f =>
            f.um === 'DAYS' &&
            calculatedDays >= f.age_from &&
            calculatedDays <= f.age_to
        )

            
        if(matchedDays){
            matchedDays.map(m => {
                items = items.map(w => m.ref_id === w.ref_id ?
                    ({
                    ...w,
                    normal_values: {
                        umComparison: 'DAYS',
                        age_from: m.age_from,
                        age_to: m.age_to,
                        min: m.min,
                        max: m.max,
                    }
                }) : w)
            })
        }

        const matchedMonths = normal_values.filter(f =>
            f.um === 'MONTHS' &&
            calculatedMonths >= f.age_from &&
            calculatedMonths <= f.age_to
        )

            
        if(matchedMonths){
            matchedMonths.map(m => {
                items = items.map(w => m.ref_id === w.ref_id ?
                    ({
                    ...w,
                    normal_values: {
                        umComparison: 'MONTHS',
                        age_from: m.age_from,
                        age_to: m.age_to,
                        min: m.min,
                        max: m.max,
                    }
                }) : w)
            })
        }


        const matchedYears = normal_values.filter(f =>
            f.um === 'YEARS' &&
            years >= f.age_from &&
            years <= f.age_to
        )

        if(matchedYears){
            matchedYears.map(m => {
                items = items.map(w => m.ref_id === w.ref_id ?
                    ({
                    ...w,
                    normal_values: {
                        umComparison: 'YEARS',
                        age_from: m.age_from,
                        age_to: m.age_to,
                        min: m.min,
                        max: m.max,
                    }
                }) : w)
            })
        }
        // console.log(items)

        
        return items

    }


    async sendToLab(id: number) {
        const exists = await this.prisma.prisma.lab_requests.findFirst({
            where: { id },
            select: {id: true}
        })

        if(!exists) throw new NotFoundException("Cererea nu a fost gasita")

        const items = await this.prisma.prisma.lab_requests.update({
            where: { id },
            data: { sent: true }
        })

        return items
    }


    async getInsertValidatedInv(id: number){

        const exists = await this.prisma.prisma.lab_requests.findFirst({
            where: { id },
            select: { id: true , patient_id: true , pacient: { select: { date_of_birth: true , cnp: true , sex: true } } , createdAt: true }
        })
        
        if(!exists) throw new NotFoundException("Nu a fost gasita cererea")


        let items = await this.prisma.prisma.results.findMany({
            where: {request_id: id},
            select: { id: true, request_id: true, investigation_id: true ,ref_id: true, ref: { select: {name: true, um: true} } ,  investigation: {select:{id: true , name: true , machines: {select: { id: true ,name: true , domains: { select: { id: true , name: true }} }}}} , result: true , validated: true , validatedId: true , validated_date: true }
        })
        const validatedIds = Array.from(
            new Set(
                items
                .filter(w => w.validated === true)
                .map(m => m.validatedId )
                .filter((id): id is number => id != null)
            )
        )

        const validatedNames = await this.prisma.prisma.users.findMany({
            where: { id: {in: validatedIds } },
            select: {id: true,  roles: true , employee_name: true }
        })

        const validatedNamesById = new Map(
            validatedNames.map(w => [w.id, {role: w.roles,name: w.employee_name}])
        )

        items = items.map( w=> ({...w, validatedName: w.validatedId ? validatedNamesById.get(w.validatedId) ?? null : null}))

        // items = items.map(w => validatedNames.map(v => w.validatedId === v.id ? {...w, validatedName: v.employee_name} : w ))

        

        const uniqueRefIds = Array.from(
            new Set(
                items
                .map(w => w.ref_id)
                .filter((id): id is number => id !== null)))

    

        const patientSex = exists.pacient.sex
        // console.log(uniqueRefIds)

        const patientAgeConverted = exists.pacient.date_of_birth
        const requestedDateConverted = exists.createdAt
 

        const result = await this.prisma.prisma.$queryRaw<{ age: number; months: number ; days: number }[]>`
        SELECT 
               EXTRACT(YEAR   FROM AGE(${requestedDateConverted}::date, ${patientAgeConverted}::date))::int AS age,
               EXTRACT(MONTH  FROM AGE(${requestedDateConverted}::date, ${patientAgeConverted}::date))::int  AS months,
               EXTRACT(DAY    FROM AGE(${requestedDateConverted}::date, ${patientAgeConverted}::date))::int  AS days
        `

        const years = result[0].age ?? 0
        const months = result[0].months ?? 0
        const days = result[0].days ?? 0


        const calculatedMonths = months + 12 * years
        const calculatedDays = days + months * 30 + years * 365

        if(uniqueRefIds.length === 0) return items

        const normal_values = await this.prisma.prisma.normal_values.findMany({
            where: { ref_id: { in: uniqueRefIds } , sex: patientSex},
            select: { ref_id: true , um: true, age_from: true , age_to: true, min: true , max: true }
        })


        const matchedDays = normal_values.filter(f =>
            f.um === 'DAYS' &&
            calculatedDays >= f.age_from &&
            calculatedDays <= f.age_to
        )

            
        if(matchedDays){
            matchedDays.map(m => {
                items = items.map(w => m.ref_id === w.ref_id ?
                    ({
                    ...w,
                    normal_values: {
                        umComparison: 'DAYS',
                        age_from: m.age_from,
                        age_to: m.age_to,
                        min: m.min,
                        max: m.max,
                    }
                }) : w)
            })
        }

        const matchedMonths = normal_values.filter(f =>
            f.um === 'MONTHS' &&
            calculatedMonths >= f.age_from &&
            calculatedMonths <= f.age_to
        )

            
        if(matchedMonths){
            matchedMonths.map(m => {
                items = items.map(w => m.ref_id === w.ref_id ?
                    ({
                    ...w,
                    normal_values: {
                        umComparison: 'MONTHS',
                        age_from: m.age_from,
                        age_to: m.age_to,
                        min: m.min,
                        max: m.max,
                    }
                }) : w)
            })
        }

        const matchedYears = normal_values.filter(f =>
            f.um === 'YEARS' &&
            years >= f.age_from &&
            years <= f.age_to
        )

        if(matchedYears){
            matchedYears.map(m => {
                items = items.map(w => m.ref_id === w.ref_id ?
                    ({
                    ...w,
                    normal_values: {
                        umComparison: 'YEARS',
                        age_from: m.age_from,
                        age_to: m.age_to,
                        min: m.min,
                        max: m.max,
                    }
                }) : w)
            })
        }
        
        return items

    }


    async deleteInsertedInv(data: number[], id: number) {

        // console.log(data)
        // console.log(id)
        const hasResults = await this.prisma.prisma.results.findMany({
            where: { request_id: id , investigation_id: {in: data} , OR: [{result: {not: null}}, {validated: true} ] },
            select: { id: true , investigation_id: true, investigation: {select : {name: true}} , validated: true , result: true}
        })
        console.log(hasResults)

        

        if(hasResults.length !== 0) throw new BadRequestException("Nu poti scoate o investigatie care are rezultat/este validata")

        const items = await this.prisma.prisma.results.deleteMany({
            where: { request_id: id,investigation_id: { in: data }}
        })
        return items
    }

    async findRefs(ids: number[]) {

        const items = await this.prisma.prisma.refs.findMany({
            where: {investigation_id: {in: ids}},
            select: {id: true, investigation_id: true, investigation: {select:{ name: true , machinesId: true}} , type: true, name: true , active: true}
        })

        return items
    }



    async patchResults(params: PatchResults){
        const { request_id , investigation_id , machine_id , ref_id , result } = params
        // console.log(ref_id + "  ajuns")
        return await this.prisma.prisma.$transaction(async (tx) => {
            const exists = await tx.results.findFirst({
                where: {request_id, investigation_id , machine_id , OR: [{ ref_id: ref_id },{ ref_id: null }]}, 
                select: { id: true, request_id: true , investigation: {select:{id: true , machines: {select: { id: true }}}} , ref_id: true },
            }) 
            
            if(!exists) {
                return await tx.results.create({
                    data: { request_id , investigation_id , machine_id , ref_id , result }
                })

            }

            if(exists?.ref_id === null) {
                const modify = await tx.results.update({
                    where: { id: exists.id },
                    data: { result: result , ref_id: ref_id }
                })
                // console.log('adaugat')
                return  modify
            } else if(exists?.ref_id === ref_id) {
                const modify = await tx.results.update({
                    where: { id: exists.id },
                    data: { result: result }
                })

                // console.log('modificat')
                return  modify
            } else {
                return await tx.results.create({
                    data: { request_id , investigation_id , machine_id , ref_id , result }
                })
            }

        })

    }




    async validateInv(userId , data: {request_id: number , ids: number[]}) {
        // console.log(userId , data.request_id, data.ids)

        return await this.prisma.prisma.$transaction(async (tx) => {
            const exists = await tx.results.findFirst({where:{ request_id: Number(data.request_id) , investigation_id: {in: data.ids} }})
            
            if(!exists) throw new BadRequestException("Nu au fost gasite investigatiile")

            const items = await tx.results.findFirst({where:{ request_id: Number(data.request_id) , investigation_id: {in: data.ids} , validated: false }})
              
            if(items) {

                return await tx.results.updateMany ({
                    where: { request_id: Number(data.request_id) , investigation_id: { in: data.ids } , validated: false },
                    data: { validatedId: userId , validated: true , validated_date: new Date() }
                })
            } else if (!items) {

                return await tx.results.updateMany({
                    where: { request_id: Number(data.request_id), investigation_id: { in: data.ids } , validated: true },
                    data: { validated: false , validatedId: null , validated_date: null }
                })
            }

        })
    }

    async deleteResults(userId: number, data: {request_id: number , ids: number[]}) {

        return await this.prisma.prisma.$transaction(async (tx) => {
            const results = await tx.results.findMany({ where: {request_id: Number(data.request_id) , investigation_id: { in: data.ids }} , select: {id: true, investigation_id: true} , orderBy: {id: 'asc'}})
           
            if(results.length === 0) throw new BadRequestException("Investigatiile nu au fost gasite")
            // console.log(exists)

            const items = new Map<number, number[]>()

            for(const r of results) {
                const arr = items.get(r.investigation_id) ?? []
                arr.push(r.id)
                items.set(r.investigation_id , arr)
            }


            for(const values of items.values()) {
                const findFirst = values[0]
                const toDelete = values.slice(1)

                await tx.results.update({
                    where: { id: findFirst },
                    data: { ref_id: null , result: null }
                })

                if(toDelete.length) {
                    await tx.results.deleteMany({
                        where: {id: {in: toDelete}}
                    })
                }
            }


        })
    }

    async getInvestigationsMachines(payload: { investigation_id: number, name: string }) {
        const trimmed = payload.name.trim()

        const items = await this.prisma.prisma.investigations.findMany({
            where: { name:  trimmed  },
            select: { id: true, machines: {select: {name: true}} }
        })
        // console.log(items)
        // if(!items) return
        // const newMachines = items.map(w => w.id === payload.investigation_id)
        if(items.length > 1) {
            return items.filter(w => w.id !== payload.investigation_id)
        }
        // console.log(newMachines)

        return items
    }

    async saveNewMachine(invId: number,id: number , currentInv: number) {

        const exists = await this.prisma.prisma.investigations.findFirst({
            where: { id: invId },
            select: {id: true , machinesId: true, name: true}
        })

        if(!exists) throw new NotFoundException("Nu a fost gasita investigatia")

        const validated = await this.prisma.prisma.results.findFirst({
            where: { investigation_id: currentInv , request_id: id},
            select: { validated: true , result: true }
        })

        if(validated?.validated) throw new BadRequestException("Investigatia este validata!!")
        if(validated?.result !== null) throw new BadRequestException("Investigatia are rezultat!!")

        const newInv = await this.prisma.prisma.results.updateMany({
            where: { investigation_id: currentInv , request_id: id },
            data: { investigation_id: exists.id, machine_id: exists.machinesId }
        })

        return newInv
    }
 
    async getPrintable() {
        const items = await this.prisma.prisma.nom_printable.findMany({
            select: { id: true , name: true , link: true }
        })


        return items
    }


}