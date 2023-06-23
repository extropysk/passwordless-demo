import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "./components/ui/button";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { challenge, token } = useAuth("https://passwordless.extropy.sk");

  if (token) {
    return <div>{token.sub}</div>;
  }

  return (
    <div className="flex justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle>Passwordless</CardTitle>
          <CardDescription>
            Scan or click to login using your LN wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!challenge ? (
            <p>loading...</p>
          ) : (
            <QRCodeSVG
              className="m-auto"
              value={`lightning:${challenge.lnurl}`}
              size={128}
              bgColor={"#000000"}
              fgColor={"#ffffff"}
              level={"M"}
            />
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <a href={`lightning:${challenge?.lnurl}`} target="_blank">
              ⚡️ Click to connect
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
