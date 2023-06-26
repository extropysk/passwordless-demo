import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getProperty } from '@/utils/ui'
import { useAuth } from '@extropysk/ln-hooks'
import { QRCodeSVG } from 'qrcode.react'

function App() {
  const { challenge, token } = useAuth('https://passwordless.extropy.sk')

  if (token) {
    return (
      <div className="flex justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>{token.sub}</CardDescription>
          </CardHeader>
          <CardContent>✅ You are logged in.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle>Passwordless</CardTitle>
          <CardDescription>powered by Extropy</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!challenge ? (
            <p>loading...</p>
          ) : (
            <>
              <a href={`lightning:${challenge.lnurl}`} target="_blank">
                <QRCodeSVG
                  value={`lightning:${challenge.lnurl}`}
                  size={128}
                  bgColor={getProperty('--background') || '#000000'}
                  fgColor={getProperty('--foreground') || '#ffffff'}
                  level={'M'}
                />
              </a>
              <Button className="w-full" asChild>
                <a href={`lightning:${challenge.lnurl}`} target="_blank">
                  ⚡️ Click to connect
                </a>
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter>Scan or click to login using your LN wallet</CardFooter>
      </Card>
    </div>
  )
}

export default App
