import { useState } from "react";
import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-red-500">
      Hello World!
      <Button onClick={() => setCount(count + 1)}>{count}</Button>
    </div>
  );
}

export default App;
