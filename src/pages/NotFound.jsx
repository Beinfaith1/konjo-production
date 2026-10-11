import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/hooks'
export default function NotFound() {
  useSeo('Page not found', 'This page does not exist.')
  return <section className="pad narrow"><p className="eyebrow">404</p><h1 className="h1">Frame <em>not found.</em></h1><p className="lede">That page does not exist.</p><Link className="btn solid" to="/work">Explore our work</Link></section>
}
