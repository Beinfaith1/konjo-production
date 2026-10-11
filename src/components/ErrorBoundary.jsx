import { Component } from 'react'
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { console.warn('Boundary caught:', e) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}
