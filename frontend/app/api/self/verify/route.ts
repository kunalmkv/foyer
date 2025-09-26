import { NextResponse } from 'next/server'
import {
    SelfBackendVerifier,
    DefaultConfigStore,
    AllIds,
} from '@selfxyz/core'

const configStore = new DefaultConfigStore({
    // Keep these aligned with your frontend disclosures
    minimumAge: 18,
    // ofac: false,
    // excludedCountries: [],
})

const verifier = new SelfBackendVerifier(
    process.env.NEXT_PUBLIC_SELF_SCOPE || 'self-workshop',
    process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'http://localhost:3000/api/self/verify',
    true,                // mockPassport: true for testing only
    AllIds,               // which document types are allowed
    configStore,
    'hex'                 // user identifier type: 'hex' (wallet) or 'uuid'
)

export const POST = async (req: Request) => {
    try {
        const body = await req.json()
        const { attestationId, proof, publicSignals, userContextData } = body || {}

        if (!proof || !publicSignals || !attestationId || !userContextData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await verifier.verify(attestationId, proof, publicSignals, userContextData)

        if (result.isValidDetails.isValid) {
            return NextResponse.json({
                status: 'success',
                disclose: result.discloseOutput,
            })
        }

        return NextResponse.json({
            status: 'error',
            details: result.isValidDetails,
        }, { status: 400 })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
    }
}
