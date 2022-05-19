

export function ResponseMessage(request: any, response: string | null, code: number, statusMessage: string | null) {

    return new Response(response, {
        status: code,
        statusText: statusMessage ?? undefined,
        headers: {
            'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') ?? "",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Max-Age': '86400',
        },
    },);
}