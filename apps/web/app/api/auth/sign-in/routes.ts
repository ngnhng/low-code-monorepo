
export async function GET(request: Request) {
  
}



const getBase: string = (req: Request) => {
  return new URL(req.url).origin;
}
