import { useReducer } from "react";
import { estadoInicialCalculadora, reduzirEstadoCalculadora } from "./estadoCalculadora";

export function useEstadoCalculadora() {
  return useReducer(reduzirEstadoCalculadora, estadoInicialCalculadora);
}
