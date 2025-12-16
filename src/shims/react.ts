/**
 * React shim - re-exports preact/compat
 * 
 * This ensures all code importing "react" gets the SAME module instance
 * as code importing "preact/compat", preventing the dual-instance hooks problem.
 */
export * from 'preact/compat';
export { default } from 'preact/compat';

