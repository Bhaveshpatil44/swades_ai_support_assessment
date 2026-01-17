
import { getInvoiceDetails } from '../tools/dbTools'

export async function billingAgent() {
    
    return await getInvoiceDetails()
}