export class Auth {
    private readonly authHeader: string;
    private encodedToken: string | null = null;
    private token: any | null = null;
    private isVerifyd: boolean | null = null;


    constructor(authHeader: string) {
        this.authHeader = authHeader;
    }


    public async isValidJwt(): Promise<boolean | null> {
        this.encodedToken = this.getJwt();
        if (this.encodedToken === null) {
            return false
        }
        this.decodeJwt();

        // Is the token expired?
        let expiryDate = new Date(this.token.payload.exp * 1000)
        let currentDate = new Date(Date.now())
        if (expiryDate <= currentDate) {
            console.log('expired token')
            return false
        }
        await this.isValidJwtSignature();
        return this.isVerifyd;
    }

    private getJwt() {
        if (!this.authHeader || this.authHeader.substring(0, 6) !== 'Bearer') {
            return null
        }
        return this.authHeader.substring(6).trim()
    }

    private decodeJwt() {
        const parts = this.encodedToken!.split('.');
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        console.log(payload["aud"]);
        const signature = atob(parts[2].replace(/_/g, '/').replace(/-/g, '+'));
        this.token = {
            header: header,
            payload: payload,
            signature: signature,
            raw: {header: parts[0], payload: parts[1], signature: parts[2]}
        };
    }

    private async isValidJwtSignature() {
        const encoder = new TextEncoder();
        const data = encoder.encode([this.token.raw.header, this.token.raw.payload].join('.'));
        // @ts-ignore
        const signature = new Uint8Array(Array.from(this.token.signature).map(c => c.charCodeAt(0)));
        // Change this to get the json from link

        // @ts-ignore
        let res = await fetch(JKW_URL); // Passar para env var
        let js: JKW_Response = await res.json();
        const jwk = js.keys[0];

        const key = await crypto.subtle.importKey('jwk', jwk, {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256'
        }, false, ['verify']);
        this.isVerifyd = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data)
    }

    public validatePermissions(permission: string): boolean{
        if (this.isVerifyd === false || this.isVerifyd === null) return false;
        if (this.token === null) return false;

        const permissionsClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/policy";
        return this.token.payload[permissionsClaim].includes(permission);
    }
}

interface JKW_Response {
    keys: JWK[]
}

interface JWK {
    alg: string
    kty: string
    key_ops: string[]
    use: string
    x5c: string[]
    n: string
    e: string
    kid: string
    x5t: string
}