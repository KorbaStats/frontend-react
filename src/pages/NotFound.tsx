import { Link } from "react-router"

const NotFound = () => {
  return (
    <div>
      <h1>Not Found</h1>
      <Link to='/' className="text-md text-blue-400 underline">Strona głowna</Link>
    </div>
  )
}

export default NotFound
