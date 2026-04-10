import "../ReservarPista/reservarPista.css";
import "./adminPista.css";
import "../../index.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

type EstadoReserva =
  | "libre"
  | "ocupada"
  | "clase"
  | "cerrado"
  | "propia"
  | "torneo"
  | "fija"
  | "evento";

interface ReservaDB {
  id: number;
  pista_id: number;
  estado: EstadoReserva;
  inicio: string;
  fin: string;
  user_id?: string | null;
  pagado_1: boolean;
  pagado_2: boolean;
  pagado_3: boolean;
  pagado_4: boolean;
  invitado_nombre?: string | null;
  invitado_tlf?: string | null;
}

interface PistaDB {
  id: number;
  nombre: string;
}

interface BloqueReserva {
  id?: number;
  pista: number;
  estado: EstadoReserva;
  inicio: string;
  fin: string;
  user_id?: string | null;
  pagado_1?: boolean;
  pagado_2?: boolean;
  pagado_3?: boolean;
  pagado_4?: boolean;
  invitado_nombre?: string | null;
  invitado_tlf?: string | null;
}

interface Pedido {
  id: number;
  reserva_id: number;
  producto: "agua" | "bolas" | "overgrip";
  cantidad: number;
  pagado: boolean;
}

function AdminPista({ date }: { date: Date }) {
  const todayISO = new Date().toISOString().split("T")[0];
  const startHour = 8;
  const endHour = 23;

  const [reservasSupabase, setReservasSupabase] = useState<ReservaDB[]>([]);
  const [pistasDB, setPistasDB] = useState<PistaDB[]>([]);

  const [errorPistas, setErrorPistas] = useState(false);

  // Overlay
  const [showOverlay, setShowOverlay] = useState(false);
  const [showOverlayConfirmacion, setshowOverlayConfirmacion] = useState(false);
  const [bloqueSeleccionado, setBloqueSeleccionado] =
    useState<BloqueReserva | null>(null);
  const [reservaSeleccionadaId, setReservaSeleccionadaId] = useState<
    number | null
  >(null);
  const [cancelOverlay, setCancelOverlay] = useState(false);
  const [cancelClaseOverlay, setCancelClaseOverlay] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [modoInvitado, setModoInvitado] = useState(false);
  const [invitadoNombre, setInvitadoNombre] = useState("");
  const [invitadoTlf, setInvitadoTlf] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string | null>(
    null,
  );

  // Pagado checkboxes
  const [pagados, setPagados] = useState<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);

  // Pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);

  // Overlay crear bloque pista
  const [showOverlayCrearBloque, setShowOverlayCrearBloque] = useState(false);
  const [fechaBloqueSeleccionada, setFechaBloqueSeleccionada] =
    useState<string>("");
  const [pistaSeleccionada, setPistaSeleccionada] = useState<number | "">("");
  const [franjaSeleccionada, setFranjaSeleccionada] = useState<string>("");
  const [crearBloqueError, setCrearBloqueError] = useState("");
  const [crearBloqueSuccess, setCrearBloqueSuccess] = useState("");

  // Overlay crear clase
  const [showOverlayCrearClase, setShowOverlayCrearClase] = useState(false);
  const [fechaClaseSeleccionada, setFechaClaseSeleccionada] =
    useState<string>("");
  const [pistaClaseSeleccionada, setPistaClaseSeleccionada] = useState<
    number | ""
  >("");
  const [franjaClaseSeleccionada, setFranjaClaseSeleccionada] =
    useState<string>("");
  const [monitorSeleccionado, setMonitorSeleccionado] = useState<string | "">(
    "",
  );
  const [crearClaseError, setCrearClaseError] = useState("");
  const [crearClaseSuccess, setCrearClaseSuccess] = useState("");

  const [perfiles, setPerfiles] = useState<
    {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      tlf: string;
      monitor: boolean;
    }[]
  >([]);

  // Overlay reservar torneo

  const [showOverlayTorneo, setShowOverlayTorneo] = useState(false);
  const [torneoFechaInicio, setTorneoFechaInicio] = useState("");
  const [torneoHoraInicio, setTorneoHoraInicio] = useState("");
  const [torneoFechaFin, setTorneoFechaFin] = useState("");
  const [torneoHoraFin, setTorneoHoraFin] = useState("");
  const [torneoError, setTorneoError] = useState("");
  const [torneoSuccess, setTorneoSuccess] = useState("");
  const [torneoLoading, setTorneoLoading] = useState(false);

  // Overlay pista fija
  const [showOverlayPistaFija, setShowOverlayPistaFija] = useState(false);
  const [fijaFechaInicio, setFijaFechaInicio] = useState("");
  const [fijaFechaFin, setFijaFechaFin] = useState("");
  const [fijaPista, setFijaPista] = useState<number | "">("");
  const [fijaFranja, setFijaFranja] = useState("");
  const [fijaUsuario, setFijaUsuario] = useState<string | null>(null);
  const [fijaBusqueda, setFijaBusqueda] = useState("");
  const [fijaError, setFijaError] = useState("");
  const [fijaSuccess, setFijaSuccess] = useState("");
  const [fijaAvisos, setFijaAvisos] = useState<string[]>([]);
  const [fijaLoading, setFijaLoading] = useState(false);
  const [fijaDiaSemana, setFijaDiaSemana] = useState<number | "">("");

  // Overlay crear bloque recurrente
  const [showOverlayRecurrente, setShowOverlayRecurrente] = useState(false);
  const [recPistas, setRecPistas] = useState<number[]>([]);
  const [recDias, setRecDias] = useState<number[]>([]);
  const [recFechaInicio, setRecFechaInicio] = useState("");
  const [recFechaFin, setRecFechaFin] = useState("");
  const [recFranjas, setRecFranjas] = useState<string[]>(Array(9).fill(""));
  const [recError, setRecError] = useState("");
  const [recSuccess, setRecSuccess] = useState("");
  const [recLoading, setRecLoading] = useState(false);

  // Overlay eliminar bloque recurrente
  const [showOverlayEliminarRec, setShowOverlayEliminarRec] = useState(false);
  const [elimRecPistas, setElimRecPistas] = useState<number[]>([]);
  const [elimRecDias, setElimRecDias] = useState<number[]>([]);
  const [elimRecFechaInicio, setElimRecFechaInicio] = useState("");
  const [elimRecFechaFin, setElimRecFechaFin] = useState("");
  const [elimRecFranjas, setElimRecFranjas] = useState<string[]>(
    Array(9).fill(""),
  );
  const [elimRecError, setElimRecError] = useState("");
  const [elimRecSuccess, setElimRecSuccess] = useState("");
  const [elimRecLoading, setElimRecLoading] = useState(false);

  // Overlay crear clase recurrente
  const [showOverlayCrearClaseRec, setShowOverlayCrearClaseRec] =
    useState(false);
  const [claseRecPista, setClaseRecPista] = useState<number | "">("");
  const [claseRecDias, setClaseRecDias] = useState<number[]>([]);
  const [claseRecFechaInicio, setClaseRecFechaInicio] = useState("");
  const [claseRecFechaFin, setClaseRecFechaFin] = useState("");
  const [claseRecFranjas, setClaseRecFranjas] = useState<string[]>(
    Array(9).fill(""),
  );
  const [claseRecMonitor, setClaseRecMonitor] = useState<string | "">("");
  const [claseRecError, setClaseRecError] = useState("");
  const [claseRecSuccess, setClaseRecSuccess] = useState("");
  const [claseRecLoading, setClaseRecLoading] = useState(false);

  // Overlay eliminar clase recurrente
  const [showOverlayEliminarClaseRec, setShowOverlayEliminarClaseRec] =
    useState(false);
  const [elimClaseRecPista, setElimClaseRecPista] = useState<number | "">("");
  const [elimClaseRecDias, setElimClaseRecDias] = useState<number[]>([]);
  const [elimClaseRecFechaInicio, setElimClaseRecFechaInicio] = useState("");
  const [elimClaseRecFechaFin, setElimClaseRecFechaFin] = useState("");
  const [elimClaseRecFranjas, setElimClaseRecFranjas] = useState<string[]>(
    Array(9).fill(""),
  );
  const [elimClaseRecError, setElimClaseRecError] = useState("");
  const [elimClaseRecSuccess, setElimClaseRecSuccess] = useState("");
  const [elimClaseRecLoading, setElimClaseRecLoading] = useState(false);
  const [elimClaseRecMonitor, setElimClaseRecMonitor] = useState<string | "">(
    "",
  );

  /* ----------------------------------------------------
      0) CARGAR PISTAS
  -----------------------------------------------------*/
  useEffect(() => {
    const cargarPistas = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pistas?select=id,nombre&order=id`;

        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPistasDB(data);
        } else {
          setErrorPistas(true);
        }
      } catch (e: any) {
        console.error("Error cargando pistas:", e);
        setErrorPistas(true);
      }
    };

    cargarPistas();
  }, []);

  /* ----------------------------------------------------
      1) GENERAR HORAS
  -----------------------------------------------------*/
  const horas: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < endHour) horas.push(`${h.toString().padStart(2, "0")}:30`);
  }

  const franjasHorarias: { inicio: string; fin: string }[] = [];
  const franjasHorariasClase: { inicio: string; fin: string }[] = [];

  function minutosAHora(minutos: number) {
    const h = Math.floor(minutos / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutos % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  // -------------------- BLOQUES 90 MIN --------------------
  const bloques90 = [
    { inicio: 9 * 60, fin: 14 * 60 },
    { inicio: 16 * 60, fin: 23 * 60 },
  ];

  bloques90.forEach(({ inicio, fin }) => {
    for (let t = inicio; t + 90 <= fin; t += 30) {
      franjasHorarias.push({
        inicio: minutosAHora(t),
        fin: minutosAHora(t + 90),
      });
    }
  });

  // -------------------- BLOQUES 60 MIN (clase) --------------------
  const bloques60 = [
    { inicio: 9 * 60, fin: 14 * 60 },
    { inicio: 16 * 60, fin: 23 * 60 },
  ];

  bloques60.forEach(({ inicio, fin }) => {
    for (let t = inicio; t + 60 <= fin; t += 30) {
      franjasHorariasClase.push({
        inicio: minutosAHora(t),
        fin: minutosAHora(t + 60),
      });
    }
  });

  /* ----------------------------------------------------
      2) CARGAR RESERVAS
  -----------------------------------------------------*/
  useEffect(() => {
    if (pistasDB.length === 0) return;

    const cargarReservas = async () => {
      const año = date.getFullYear();
      const mes = (date.getMonth() + 1).toString().padStart(2, "0");
      const dia = date.getDate().toString().padStart(2, "0");
      const fechaStr = `${año}-${mes}-${dia}`;

      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/reservas?select=*&inicio=gte.${fechaStr}T00:00:00&inicio=lt.${fechaStr}T23:59:59&order=inicio.asc`;

        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) setReservasSupabase(data);
      } catch (e: any) {
        console.error("Error cargando reservas:", e);
      }
    };

    cargarReservas();
  }, [date, pistasDB]);

  /* ----------------------------------------------------
      3) CARGAR PERFILES
  -----------------------------------------------------*/
  useEffect(() => {
    const cargarPerfiles = async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("id, first_name, last_name, email, tlf, monitor")
        .order("first_name", { ascending: true })
        .order("last_name", { ascending: true });

      if (error) {
        console.error("Error cargando perfiles:", error);
        return;
      }
      const perfilesMapeados = (data || []).map((p: any) => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        tlf: p.tlf,
        monitor: Boolean(p.monitor),
      }));

      setPerfiles(perfilesMapeados);
    };
    cargarPerfiles();
  }, []);

  const monitores = perfiles.filter((p) => p.monitor === true);

  /* ----------------------------------------------------
      3) FUNCIONES DE POSICIÓN
  -----------------------------------------------------*/
  const calcularFila = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return (h - startHour) * 2 + (m === 30 ? 2 : 1);
  };

  const calcularFilasBloque = (inicio: string, fin: string) => {
    return calcularFila(fin) - calcularFila(inicio);
  };

  /* ----------------------------------------------------
      4) TRANSFORMAR RESERVAS
  -----------------------------------------------------*/
  const reservasDelDia: BloqueReserva[] = reservasSupabase.map((r) => {
    const inicioDate = new Date(r.inicio);
    const finDate = new Date(r.fin);
    return {
      id: r.id,
      pista: r.pista_id,
      estado: r.estado,
      inicio: inicioDate.toTimeString().slice(0, 5),
      fin: finDate.toTimeString().slice(0, 5),
      user_id: r.user_id || null,
      pagado_1: r.pagado_1 ?? false,
      pagado_2: r.pagado_2 ?? false,
      pagado_3: r.pagado_3 ?? false,
      pagado_4: r.pagado_4 ?? false,
      invitado_nombre: r.invitado_nombre || null,
      invitado_tlf: r.invitado_tlf || null,
    };
  });

  /* ----------------------------------------------------
      4.5) BLOQUES CERRADOS
  -----------------------------------------------------*/
  const horariosCerrados = [
    { inicio: "08:00", fin: "09:00" },
    { inicio: "14:00", fin: "16:00" },
    { inicio: "23:00", fin: "23:30" },
  ];

  const bloquesCerrados: BloqueReserva[] = [];

  pistas.forEach((pista) => {
    horariosCerrados.forEach((horario) => {
      const yaExiste = reservasDelDia.some(
        (r) =>
          r.pista === pista &&
          r.inicio <= horario.inicio &&
          r.fin >= horario.fin,
      );
      if (!yaExiste) {
        bloquesCerrados.push({
          pista,
          inicio: horario.inicio,
          fin: horario.fin,
          estado: "cerrado",
        });
      }
    });
  });

  const todasLasReservas = [...reservasDelDia, ...bloquesCerrados];

  /* ----------------------------------------------------
      5) CELDAS OCUPADAS
  -----------------------------------------------------*/
  const estaCeldaOcupada = (pista: number, hora: string): boolean => {
    const [h, m] = hora.split(":").map(Number);
    const minuto = h * 60 + m;
    return todasLasReservas.some((r) => {
      if (r.pista !== pista) return false;
      const [ih, im] = r.inicio.split(":").map(Number);
      const [fh, fm] = r.fin.split(":").map(Number);
      const inicioMin = ih * 60 + im;
      const finMin = fh * 60 + fm;
      return minuto >= inicioMin && minuto < finMin;
    });
  };

  /* ----------------------------------------------------
      6) LOGICA CLICK
  -----------------------------------------------------*/
  const abrirOverlay = async (
    bloque: BloqueReserva,
    esCancelar: boolean,
    esCancelarClase: boolean,
  ) => {
    setBloqueSeleccionado(bloque);
    setReservaSeleccionadaId(bloque.id || null);
    setShowOverlay(true);
    setTimeout(() => {
      const contenido = document.querySelector(".reservas_contenido");
      if (contenido) contenido.scrollTop = 0;
    }, 0);
    setCancelOverlay(esCancelar);
    setCancelClaseOverlay(esCancelarClase);
    setBusquedaUsuario("");
    setModoInvitado(false);
    setInvitadoNombre("");
    setInvitadoTlf("");
    setUsuarioSeleccionado(null);
    setErrorMsg("");
    setSuccessMsg("");
    setPedidos([]);

    setPagados([
      bloque.pagado_1 ?? false,
      bloque.pagado_2 ?? false,
      bloque.pagado_3 ?? false,
      bloque.pagado_4 ?? false,
    ]);

    if (bloque.user_id && !perfiles.find((p) => p.id === bloque.user_id)) {
      try {
        const { data, error } = await supabase
          .from("profile")
          .select("id, first_name, last_name, email, tlf, monitor")
          .eq("id", bloque.user_id)
          .single();
        if (!error && data) {
          setPerfiles((prev) => [
            ...prev,
            {
              id: data.id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              tlf: data.tlf,
              monitor: Boolean(data.monitor),
            },
          ]);
        }
      } catch (err) {
        console.error("Error inesperado al cargar perfil:", err);
      }
    }

    // Cargar pedidos solo en reservas ocupadas
    if (esCancelar && bloque.id) {
      setPedidosLoading(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("reserva_id", bloque.id)
        .order("created_at", { ascending: true });
      if (!error) setPedidos(data || []);
      setPedidosLoading(false);
    }
  };

  const handleClickLibre = (bloque: BloqueReserva) =>
    abrirOverlay(bloque, false, false);
  const handleClickOcupada = (bloque: BloqueReserva) =>
    abrirOverlay(bloque, true, false);
  const handleClickClase = (bloque: BloqueReserva) =>
    abrirOverlay(bloque, false, true);

  /* ----------------------------------------------------
      6.0) ACTUALIZAR PAGADO (individual, optimista)
  -----------------------------------------------------*/
  const handleTogglePagado = async (index: 0 | 1 | 2 | 3, value: boolean) => {
    if (!reservaSeleccionadaId) return;

    setPagados((prev) => {
      const next = [...prev] as [boolean, boolean, boolean, boolean];
      next[index] = value;
      return next;
    });

    setBloqueSeleccionado((prev) =>
      prev ? { ...prev, [`pagado_${index + 1}`]: value } : prev,
    );

    const campo = `pagado_${index + 1}` as
      | "pagado_1"
      | "pagado_2"
      | "pagado_3"
      | "pagado_4";

    const { error } = await supabase
      .from("reservas")
      .update({ [campo]: value })
      .eq("id", reservaSeleccionadaId);

    if (error) {
      console.error("Error actualizando pagado:", error);
      setPagados((prev) => {
        const next = [...prev] as [boolean, boolean, boolean, boolean];
        next[index] = !value;
        return next;
      });
    } else {
      setReservasSupabase((prev) =>
        prev.map((r) =>
          r.id === reservaSeleccionadaId ? { ...r, [campo]: value } : r,
        ),
      );
    }
  };

  /* ----------------------------------------------------
      6.0c) PEDIDOS
  -----------------------------------------------------*/
  const PRODUCTOS = [
    { key: "agua", label: "💧 Agua" },
    { key: "bolas", label: "🥎 Bolas" },
    { key: "overgrip", label: "🎾 Overgrip" },
  ] as const;

  const handleAñadirProducto = async (
    producto: "agua" | "bolas" | "overgrip",
  ) => {
    if (!reservaSeleccionadaId) return;

    const { data, error } = await supabase
      .from("pedidos")
      .insert({
        reserva_id: reservaSeleccionadaId,
        producto,
        cantidad: 1,
        pagado: false,
      })
      .select()
      .single();
    if (!error && data) setPedidos((prev) => [...prev, data]);
  };

  const handleReducirProducto = async (pedido: Pedido) => {
    setPedidos((prev) => prev.filter((p) => p.id !== pedido.id));
    await supabase.from("pedidos").delete().eq("id", pedido.id);
  };

  const handleTogglePedidoPagado = async (pedido: Pedido, value: boolean) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, pagado: value } : p)),
    );
    await supabase
      .from("pedidos")
      .update({ pagado: value })
      .eq("id", pedido.id);
  };

  /* ----------------------------------------------------
      6.0b) CREAR BLOQUE
  -----------------------------------------------------*/
  const handleCrearBloquePista = async () => {
    setCrearBloqueError("");
    setCrearBloqueSuccess("");
    setFechaBloqueSeleccionada("");

    if (!fechaBloqueSeleccionada || !pistaSeleccionada || !franjaSeleccionada) {
      setCrearBloqueError("Debes seleccionar fecha, pista y horario.");
      return;
    }

    const [inicioHora, finHora] = franjaSeleccionada.split(" - ");
    const fecha = fechaBloqueSeleccionada;

    try {
      const { error } = await supabase.from("reservas").insert({
        pista_id: pistaSeleccionada,
        estado: "libre",
        inicio: `${fecha}T${inicioHora}:00`,
        fin: `${fecha}T${finHora}:00`,
        user_id: null,
      });

      if (error) {
        console.error(error);
        if (
          error.message.includes("solapa") ||
          error.message.includes("overlap")
        ) {
          setCrearBloqueError("Ya hay una pista que se solapa en ese horario.");
        } else {
          setCrearBloqueError("No se pudo crear el bloque.");
        }
        return;
      }

      setCrearBloqueSuccess("¡Bloque creado correctamente!");

      setTimeout(() => {
        setShowOverlayCrearBloque(false);
        setPistaSeleccionada("");
        setFranjaSeleccionada("");
        setCrearBloqueSuccess("");
        setCrearBloqueError("");

        const año = date.getFullYear();
        const mes = (date.getMonth() + 1).toString().padStart(2, "0");
        const dia = date.getDate().toString().padStart(2, "0");
        const fechaStr = `${año}-${mes}-${dia}`;

        supabase
          .from("reservas")
          .select("*")
          .gte("inicio", `${fechaStr}T00:00:00`)
          .lt("inicio", `${fechaStr}T23:59:59`)
          .order("inicio", { ascending: true })
          .then(({ data }) => setReservasSupabase(data || []));
      }, 1200);
    } catch (err) {
      console.error(err);
      setCrearBloqueError("Error inesperado.");
    }
  };

  /* ----------------------------------------------------
      6.1) CONFIRMAR RESERVA
  -----------------------------------------------------*/
  const handleConfirmarReserva = async () => {
    if (!reservaSeleccionadaId) {
      setErrorMsg("No se pudo identificar la reserva.");
      return;
    }

    if (!modoInvitado && !usuarioSeleccionado) {
      setErrorMsg("Debes seleccionar un usuario.");
      return;
    }

    if (modoInvitado && !invitadoNombre.trim()) {
      setErrorMsg("Debes introducir el nombre del invitado.");
      return;
    }

    try {
      const updatePayload = modoInvitado
        ? {
            estado: "ocupada",
            user_id: null,
            invitado_nombre: invitadoNombre.trim(),
            invitado_tlf: invitadoTlf.trim() || null,
          }
        : {
            estado: "ocupada",
            user_id: usuarioSeleccionado,
            invitado_nombre: null,
            invitado_tlf: null,
          };

      const { data, error } = await supabase
        .from("reservas")
        .update(updatePayload)
        .eq("id", reservaSeleccionadaId)
        .eq("estado", "libre")
        .select("*");

      if (error) {
        console.error("Error al reservar:", error);
        if (
          error.message.includes(
            "No se puede modificar una reserva con inicio en el pasado",
          )
        ) {
          setErrorMsg("No se puede reservar una pista ya iniciada.");
        } else if (
          error.message.includes(
            "El usuario ya tiene una reserva que solapa con este horario",
          )
        ) {
          setErrorMsg(
            "El usuario ya tiene una reserva que solapa con este horario.",
          );
        } else if (
          error.message.includes(
            "Ya existe otra reserva en esta pista que se solapa en el horario",
          )
        ) {
          setErrorMsg("Ya existe otra reserva en esta pista en ese horario.");
        } else {
          setErrorMsg("Error al confirmar la reserva. Inténtalo de nuevo.");
        }
        return;
      }

      if (!data || data.length === 0) {
        setErrorMsg(
          "Otro usuario ha reservado esta pista. Recarga la página para ver la información actualizada.",
        );
        return;
      }

      setSuccessMsg("¡Pista reservada!");
      setTimeout(() => {
        setShowOverlay(false);
        setSuccessMsg("");
        setUsuarioSeleccionado(null);
        setInvitadoNombre("");
        setInvitadoTlf("");
        setModoInvitado(false);

        const cargarReservas = async () => {
          const año = date.getFullYear();
          const mes = (date.getMonth() + 1).toString().padStart(2, "0");
          const dia = date.getDate().toString().padStart(2, "0");
          const fechaStr = `${año}-${mes}-${dia}`;
          const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .gte("inicio", `${fechaStr}T00:00:00`)
            .lt("inicio", `${fechaStr}T23:59:59`)
            .order("inicio", { ascending: true });
          if (!error) setReservasSupabase(data || []);
        };
        cargarReservas();
      }, 1500);
    } catch (error) {
      console.error("Error inesperado:", error);
      setErrorMsg("Error inesperado al reservar.");
    }
  };

  /* ----------------------------------------------------
      6.2) CANCELAR RESERVA
  -----------------------------------------------------*/
  const handleCancelarReserva = async () => {
    if (!reservaSeleccionadaId || !bloqueSeleccionado) {
      setErrorMsg("No se pudo identificar la reserva.");
      return;
    }

    try {
      let response;

      if (bloqueSeleccionado.estado === "clase") {
        response = await supabase
          .from("reservas")
          .delete()
          .eq("id", reservaSeleccionadaId);
      } else {
        response = await supabase
          .from("reservas")
          .update({
            estado: "libre",
            user_id: null,
            pagado_1: false,
            pagado_2: false,
            pagado_3: false,
            pagado_4: false,
          })
          .eq("id", reservaSeleccionadaId);
      }

      if (response.error) {
        console.error("Error al cancelar:", response.error);
        setErrorMsg("Error al cancelar la reserva.");
        return;
      }

      setSuccessMsg(
        bloqueSeleccionado.estado === "clase"
          ? "¡Clase eliminada!"
          : "¡Reserva cancelada!",
      );

      setTimeout(() => {
        setShowOverlay(false);
        setSuccessMsg("");

        const cargarReservas = async () => {
          const año = date.getFullYear();
          const mes = (date.getMonth() + 1).toString().padStart(2, "0");
          const dia = date.getDate().toString().padStart(2, "0");
          const fechaStr = `${año}-${mes}-${dia}`;

          const { data } = await supabase
            .from("reservas")
            .select("*")
            .gte("inicio", `${fechaStr}T00:00:00`)
            .lt("inicio", `${fechaStr}T23:59:59`)
            .order("inicio", { ascending: true });

          setReservasSupabase(data || []);
        };

        cargarReservas();
      }, 1500);
    } catch (err) {
      console.error("Error inesperado:", err);
      setErrorMsg("Error inesperado al cancelar.");
    }
  };

  /* ----------------------------------------------------
      6.3) ELIMINAR BLOQUE
  -----------------------------------------------------*/
  const handleEliminarBloque = async () => {
    if (!reservaSeleccionadaId) {
      setErrorMsg("No se pudo identificar la reserva.");
      return;
    }

    try {
      const { error } = await supabase
        .from("reservas")
        .delete()
        .eq("id", reservaSeleccionadaId);

      if (error) {
        console.error("Error al eliminar el bloque:", error);
        setErrorMsg("Error al confirmar la reserva. Inténtalo de nuevo.");
        return;
      }

      setSuccessMsg("¡Bloque eliminado!");
      setTimeout(() => {
        setShowOverlay(false);
        setSuccessMsg("");
        setUsuarioSeleccionado(null);

        const cargarReservas = async () => {
          const año = date.getFullYear();
          const mes = (date.getMonth() + 1).toString().padStart(2, "0");
          const dia = date.getDate().toString().padStart(2, "0");
          const fechaStr = `${año}-${mes}-${dia}`;

          const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .gte("inicio", `${fechaStr}T00:00:00`)
            .lt("inicio", `${fechaStr}T23:59:59`)
            .order("inicio", { ascending: true });

          if (!error) setReservasSupabase(data || []);
        };
        cargarReservas();
      }, 1500);
    } catch (error) {
      console.error("Error inesperado:", error);
      setErrorMsg("Error inesperado al eliminar el bloque.");
    }
  };

  /* ----------------------------------------------------
      6.4) CREAR CLASE
  -----------------------------------------------------*/
  const handleCrearClase = async () => {
    setCrearClaseError("");
    setCrearClaseSuccess("");

    if (
      !fechaClaseSeleccionada ||
      !pistaClaseSeleccionada ||
      !franjaClaseSeleccionada ||
      !monitorSeleccionado
    ) {
      setCrearClaseError("Debes seleccionar fecha, pista, horario y monitor.");
      return;
    }

    const [inicioHora, finHora] = franjaClaseSeleccionada.split(" - ");
    const fecha = fechaClaseSeleccionada;

    try {
      const { error } = await supabase.from("reservas").insert({
        pista_id: pistaClaseSeleccionada,
        estado: "clase",
        inicio: `${fecha}T${inicioHora}:00`,
        fin: `${fecha}T${finHora}:00`,
        user_id: monitorSeleccionado,
      });

      if (error) {
        console.error(error);
        setCrearClaseError(
          error.message.includes(
            "Ya existe otra reserva en esta pista que se solapa en el horario",
          )
            ? "Ya hay una reserva que se solapa en este horario."
            : "No se pudo crear la clase.",
        );
        return;
      }

      setCrearClaseSuccess("¡Clase creada correctamente!");
      setTimeout(() => {
        setShowOverlayCrearClase(false);
        setFechaClaseSeleccionada("");
        setPistaClaseSeleccionada("");
        setFranjaClaseSeleccionada("");
        setMonitorSeleccionado("");
        setCrearClaseError("");
        setCrearClaseSuccess("");

        const fechaStr = fecha;
        supabase
          .from("reservas")
          .select("*")
          .gte("inicio", `${fechaStr}T00:00:00`)
          .lt("inicio", `${fechaStr}T23:59:59`)
          .order("inicio", { ascending: true })
          .then(({ data }) => setReservasSupabase(data || []));
      }, 1200);
    } catch (err) {
      console.error(err);
      setCrearClaseError("Error inesperado.");
    }
  };

  /* ----------------------------------------------------
    6.5) BLOQUEAR TORNEO
-----------------------------------------------------*/
  const handleBloquearTorneo = async () => {
    setTorneoError("");
    setTorneoSuccess("");

    if (
      !torneoFechaInicio ||
      !torneoHoraInicio ||
      !torneoFechaFin ||
      !torneoHoraFin
    ) {
      setTorneoError("Debes seleccionar fecha y hora de inicio y fin.");
      return;
    }

    const horaInicioMin =
      parseInt(torneoHoraInicio.split(":")[0]) * 60 +
      parseInt(torneoHoraInicio.split(":")[1]);
    const horaFinMin =
      parseInt(torneoHoraFin.split(":")[0]) * 60 +
      parseInt(torneoHoraFin.split(":")[1]);

    // Validar que fin > inicio
    if (
      torneoFechaFin < torneoFechaInicio ||
      (torneoFechaFin === torneoFechaInicio && horaFinMin <= horaInicioMin)
    ) {
      setTorneoError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    setTorneoLoading(true);

    // 1) Calcular todos los bloques que hay que reservar
    type Bloque = { fecha: string; horaInicio: string; horaFin: string };
    const bloques: Bloque[] = [];

    const franjas = [
      { inicioMin: 9 * 60, finMin: 14 * 60 },
      { inicioMin: 16 * 60, finMin: 23 * 60 },
    ];

    const pad = (n: number) => n.toString().padStart(2, "0");
    const toHora = (min: number) =>
      `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

    // Generar lista de fechas usando mediodía para evitar problemas de DST
    const fechas: string[] = [];
    const cursor = new Date(`${torneoFechaInicio}T12:00:00`);
    const cursorFin = new Date(`${torneoFechaFin}T12:00:00`);
    while (cursor <= cursorFin) {
      fechas.push(cursor.toISOString().split("T")[0]);
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const fecha of fechas) {
      const esPrimerDia = fecha === torneoFechaInicio;
      const esUltimoDia = fecha === torneoFechaFin;

      for (const franja of franjas) {
        const bloqueInicioMin = Math.max(
          franja.inicioMin,
          esPrimerDia ? horaInicioMin : 0,
        );
        const bloqueFinMin = Math.min(
          franja.finMin,
          esUltimoDia ? horaFinMin : 24 * 60,
        );

        if (bloqueFinMin > bloqueInicioMin) {
          bloques.push({
            fecha,
            horaInicio: toHora(bloqueInicioMin),
            horaFin: toHora(bloqueFinMin),
          });
        }
      }
    }

    if (bloques.length === 0) {
      setTorneoError(
        "El rango seleccionado no coincide con ninguna franja horaria válida (09:00–14:00 o 16:00–23:00).",
      );
      setTorneoLoading(false);
      return;
    }

    console.log("=== DEPURACIÓN TORNEO ===");
    console.log("Bloques calculados:", bloques);

    // 2) Comprobar si hay reservas NO libres en ese rango
    const rangoInicioStr = `${bloques[0].fecha}T${bloques[0].horaInicio}:00`;
    const rangoFinStr = `${bloques[bloques.length - 1].fecha}T${bloques[bloques.length - 1].horaFin}:00`;

    console.log("Rango query inicio:", rangoInicioStr);
    console.log("Rango query fin:", rangoFinStr);

    const { data: reservasConflicto, error: errorConflicto } = await supabase
      .from("reservas")
      .select("id, estado, inicio, fin, pista_id")
      .gte("inicio", rangoInicioStr)
      .lte("inicio", rangoFinStr)
      .neq("estado", "libre")
      .neq("estado", "cerrado");

    console.log("Reservas conflicto encontradas:", reservasConflicto);
    console.log("Error query:", errorConflicto);

    if (errorConflicto) {
      setTorneoError("Error al comprobar reservas existentes.");
      setTorneoLoading(false);
      return;
    }

    if (reservasConflicto && reservasConflicto.length > 0) {
      const detalle = reservasConflicto
        .map((r) => {
          const h = new Date(r.inicio).toLocaleString("es-ES", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          return `Pista ${r.pista_id} – ${r.estado} – ${h}`;
        })
        .join("\n");
      setTorneoError(
        `Hay reservas activas que impiden el bloqueo:\n${detalle}`,
      );
      setTorneoLoading(false);
      return;
    }

    // 3) Borrar todas las reservas "libre" en el rango para todas las pistas
    const { error: errorBorrar } = await supabase
      .from("reservas")
      .delete()
      .gte("inicio", rangoInicioStr)
      .lte("inicio", rangoFinStr)
      .eq("estado", "libre");

    if (errorBorrar) {
      setTorneoError("Error al liberar las pistas.");
      setTorneoLoading(false);
      return;
    }

    // 4) Insertar bloques de torneo para cada pista
    const inserts = pistasDB.flatMap((p) =>
      bloques.map((b) => ({
        pista_id: p.id,
        estado: "torneo",
        inicio: `${b.fecha}T${b.horaInicio}:00`,
        fin: `${b.fecha}T${b.horaFin}:00`,
        user_id: null,
      })),
    );

    const { error: errorInsertar } = await supabase
      .from("reservas")
      .insert(inserts);

    if (errorInsertar) {
      setTorneoError("Error al crear los bloques de torneo.");
      setTorneoLoading(false);
      return;
    }

    setTorneoSuccess(
      `¡Torneo bloqueado correctamente! ${inserts.length} bloques creados.`,
    );
    setTorneoLoading(false);

    // Recargar reservas del día visible
    setTimeout(() => {
      setShowOverlayTorneo(false);
      setTorneoFechaInicio("");
      setTorneoHoraInicio("");
      setTorneoFechaFin("");
      setTorneoHoraFin("");
      setTorneoSuccess("");

      const año = date.getFullYear();
      const mes = (date.getMonth() + 1).toString().padStart(2, "0");
      const dia = date.getDate().toString().padStart(2, "0");
      const fechaStr = `${año}-${mes}-${dia}`;
      supabase
        .from("reservas")
        .select("*")
        .gte("inicio", `${fechaStr}T00:00:00`)
        .lt("inicio", `${fechaStr}T23:59:59`)
        .order("inicio", { ascending: true })
        .then(({ data }) => setReservasSupabase(data || []));
    }, 2000);
  };

  /* ----------------------------------------------------
    6.6) ASIGNAR PISTA FIJA
-----------------------------------------------------*/
  const handleAsignarPistaFija = async () => {
    setFijaError("");
    setFijaSuccess("");
    setFijaAvisos([]);

    if (
      !fijaFechaInicio ||
      !fijaFechaFin ||
      !fijaPista ||
      !fijaFranja ||
      !fijaUsuario ||
      fijaDiaSemana === ""
    ) {
      setFijaError("Debes completar todos los campos.");
      return;
    }

    if (fijaFechaFin < fijaFechaInicio) {
      setFijaError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    const [inicioHora] = fijaFranja.split(" - ");

    setFijaLoading(true);

    // Generar todas las fechas del día de la semana elegido entre inicio y fin
    const fechaLimite = new Date(`${fijaFechaFin}T12:00:00`);

    const fechas: string[] = [];
    const cursor = new Date(`${fijaFechaInicio}T12:00:00`);
    while (cursor <= fechaLimite) {
      if (cursor.getDay() === fijaDiaSemana) {
        fechas.push(cursor.toISOString().split("T")[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (fechas.length === 0) {
      setFijaError("No hay fechas válidas en el rango seleccionado.");
      setFijaLoading(false);
      return;
    }

    // Buscar reservas existentes en esas fechas/pista/franja
    const avisos: string[] = [];
    const reservasAOcupar: number[] = [];

    for (const fecha of fechas) {
      const { data, error } = await supabase
        .from("reservas")
        .select("id, estado, inicio, user_id, invitado_nombre")
        .eq("pista_id", fijaPista)
        .eq("inicio", `${fecha}T${inicioHora}:00`);

      if (error) {
        setFijaError("Error al comprobar reservas.");
        setFijaLoading(false);
        return;
      }

      const reserva = data?.[0];
      const fechaFormateada = new Date(`${fecha}T12:00:00`).toLocaleDateString(
        "es-ES",
        { weekday: "long", day: "2-digit", month: "long" },
      );

      if (!reserva) {
        avisos.push(
          `${fechaFormateada} ${inicioHora} — sin bloque en base de datos`,
        );
      } else if (reserva.estado === "libre") {
        reservasAOcupar.push(reserva.id);
      } else if (reserva.estado === "clase") {
        avisos.push(`${fechaFormateada} ${inicioHora} — hay una clase`);
      } else if (reserva.estado === "ocupada") {
        const nombre =
          reserva.invitado_nombre ||
          perfiles.find((p) => p.id === reserva.user_id)?.first_name +
            " " +
            perfiles.find((p) => p.id === reserva.user_id)?.last_name ||
          "otro usuario";
        avisos.push(`${fechaFormateada} ${inicioHora} — ocupada por ${nombre}`);
      } else {
        avisos.push(
          `${fechaFormateada} ${inicioHora} — estado: ${reserva.estado}`,
        );
      }
    }

    // Actualizar las que están libres
    if (reservasAOcupar.length > 0) {
      const { error } = await supabase
        .from("reservas")
        .update({
          estado: "ocupada",
          user_id: fijaUsuario,
          invitado_nombre: null,
          invitado_tlf: null,
        })
        .in("id", reservasAOcupar);

      if (error) {
        setFijaError("Error al asignar las reservas.");
        setFijaLoading(false);
        return;
      }
    }

    setFijaAvisos(avisos);
    setFijaSuccess(
      `✅ ${reservasAOcupar.length} reserva${reservasAOcupar.length !== 1 ? "s" : ""} asignada${reservasAOcupar.length !== 1 ? "s" : ""} correctamente.` +
        (avisos.length > 0 ? ` ${avisos.length} con aviso.` : ""),
    );
    setFijaLoading(false);

    // Recargar calendario
    const año = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const dia = date.getDate().toString().padStart(2, "0");
    const fechaStr = `${año}-${mes}-${dia}`;
    supabase
      .from("reservas")
      .select("*")
      .gte("inicio", `${fechaStr}T00:00:00`)
      .lt("inicio", `${fechaStr}T23:59:59`)
      .order("inicio", { ascending: true })
      .then(({ data }) => setReservasSupabase(data || []));
  };

  /* ----------------------------------------------------
    6.7) CREAR BLOQUE RECURRENTE
-----------------------------------------------------*/
  const handleCrearBloqueRecurrente = async () => {
    setRecError("");
    setRecSuccess("");

    if (recPistas.length === 0) {
      setRecError("Debes seleccionar al menos una pista.");
      return;
    }
    if (recDias.length === 0) {
      setRecError("Debes seleccionar al menos un día de la semana.");
      return;
    }
    if (!recFechaInicio || !recFechaFin) {
      setRecError("Debes seleccionar fecha de inicio y fin.");
      return;
    }
    if (recFechaFin < recFechaInicio) {
      setRecError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    const inicio = new Date(`${recFechaInicio}T12:00:00`);
    const fin = new Date(`${recFechaFin}T12:00:00`);
    const diffMeses =
      (fin.getFullYear() - inicio.getFullYear()) * 12 +
      (fin.getMonth() - inicio.getMonth());
    if (diffMeses > 12) {
      setRecError("El rango máximo es de 12 meses.");
      return;
    }

    const franjasSeleccionadas = recFranjas.filter((f) => f !== "");
    if (franjasSeleccionadas.length === 0) {
      setRecError("Debes seleccionar al menos una franja horaria.");
      return;
    }

    // Comprobar solapamientos entre franjas seleccionadas
    const franjasParseadas = franjasSeleccionadas.map((f) => {
      const [ini, finH] = f.split(" - ");
      const [ih, im] = ini.split(":").map(Number);
      const [fh, fm] = finH.split(":").map(Number);
      return { ini: ih * 60 + im, fin: fh * 60 + fm, label: f };
    });

    for (let i = 0; i < franjasParseadas.length; i++) {
      for (let j = i + 1; j < franjasParseadas.length; j++) {
        const a = franjasParseadas[i];
        const b = franjasParseadas[j];
        if (a.ini < b.fin && b.ini < a.fin) {
          setRecError(
            `Las franjas "${a.label}" y "${b.label}" se solapan. Corrígelas antes de continuar.`,
          );
          return;
        }
      }
    }

    setRecLoading(true);

    // Generar fechas que coincidan con los días seleccionados
    const fechas: string[] = [];
    const cursor = new Date(`${recFechaInicio}T12:00:00`);
    while (cursor <= fin) {
      if (recDias.includes(cursor.getDay())) {
        fechas.push(cursor.toISOString().split("T")[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (fechas.length === 0) {
      setRecError(
        "No hay fechas válidas con los días seleccionados en ese rango.",
      );
      setRecLoading(false);
      return;
    }

    // Buscar reservas existentes para detectar solapamientos
    const { data: reservasExistentes, error: errorConsulta } = await supabase
      .from("reservas")
      .select("pista_id, inicio, fin")
      .in("pista_id", recPistas)
      .gte("inicio", `${recFechaInicio}T00:00:00`)
      .lte("inicio", `${recFechaFin}T23:59:59`);

    if (errorConsulta) {
      setRecError("Error al consultar reservas existentes.");
      setRecLoading(false);
      return;
    }

    // Set de ocupados para lookup rápido: "pistaId|fecha|horaInicio"
    const ocupados = new Set<string>();
    for (const r of reservasExistentes || []) {
      const fechaR = new Date(r.inicio).toISOString().split("T")[0];
      const horaR = new Date(r.inicio).toTimeString().slice(0, 5);
      ocupados.add(`${r.pista_id}|${fechaR}|${horaR}`);
    }

    // Generar inserts evitando solapamientos
    const inserts: {
      pista_id: number;
      estado: string;
      inicio: string;
      fin: string;
      user_id: null;
    }[] = [];

    for (const fecha of fechas) {
      for (const pistaId of recPistas) {
        const reservasEstaPista = (reservasExistentes || []).filter((r) => {
          const fechaR = new Date(r.inicio).toISOString().split("T")[0];
          return r.pista_id === pistaId && fechaR === fecha;
        });

        for (const franja of franjasSeleccionadas) {
          const [inicioHora, finHora] = franja.split(" - ");
          const [ih, im] = inicioHora.split(":").map(Number);
          const [fh, fm] = finHora.split(":").map(Number);
          const franjaIni = ih * 60 + im;
          const franjaFin = fh * 60 + fm;

          const solapa = reservasEstaPista.some((r) => {
            const horaInicioR = new Date(r.inicio).toTimeString().slice(0, 5);
            const horaFinR = new Date(r.fin).toTimeString().slice(0, 5);
            const [rih, rim] = horaInicioR.split(":").map(Number);
            const [rfh, rfm] = horaFinR.split(":").map(Number);
            const resIni = rih * 60 + rim;
            const resFin = rfh * 60 + rfm;
            return franjaIni < resFin && resIni < franjaFin;
          });

          if (!solapa) {
            inserts.push({
              pista_id: pistaId,
              estado: "libre",
              inicio: `${fecha}T${inicioHora}:00`,
              fin: `${fecha}T${finHora}:00`,
              user_id: null,
            });
          }
        }
      }
    }

    if (inserts.length === 0) {
      setRecError(
        "No hay bloques nuevos que crear. Todos los horarios ya están ocupados.",
      );
      setRecLoading(false);
      return;
    }

    // Insertar en lotes de 500
    const LOTE = 500;
    for (let i = 0; i < inserts.length; i += LOTE) {
      const lote = inserts.slice(i, i + LOTE);
      const { error: errorInsert } = await supabase
        .from("reservas")
        .insert(lote);
      if (errorInsert) {
        setRecError(
          `Error al insertar bloques (lote ${Math.floor(i / LOTE) + 1}).`,
        );
        setRecLoading(false);
        return;
      }
    }

    setRecSuccess(
      `✅ ${inserts.length} bloque${inserts.length !== 1 ? "s" : ""} creado${inserts.length !== 1 ? "s" : ""} correctamente.`,
    );
    setRecLoading(false);

    // Recargar calendario del día visible
    const año = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const dia = date.getDate().toString().padStart(2, "0");
    const fechaStr = `${año}-${mes}-${dia}`;
    supabase
      .from("reservas")
      .select("*")
      .gte("inicio", `${fechaStr}T00:00:00`)
      .lt("inicio", `${fechaStr}T23:59:59`)
      .order("inicio", { ascending: true })
      .then(({ data }) => setReservasSupabase(data || []));
  };

  /* ----------------------------------------------------
    6.8) ELIMINAR BLOQUE RECURRENTE
-----------------------------------------------------*/
  const handleEliminarBloqueRecurrente = async () => {
    setElimRecError("");
    setElimRecSuccess("");

    if (elimRecPistas.length === 0) {
      setElimRecError("Debes seleccionar al menos una pista.");
      return;
    }
    if (elimRecDias.length === 0) {
      setElimRecError("Debes seleccionar al menos un día de la semana.");
      return;
    }
    if (!elimRecFechaInicio || !elimRecFechaFin) {
      setElimRecError("Debes seleccionar fecha de inicio y fin.");
      return;
    }
    if (elimRecFechaFin < elimRecFechaInicio) {
      setElimRecError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    const franjasSeleccionadas = elimRecFranjas.filter((f) => f !== "");
    if (franjasSeleccionadas.length === 0) {
      setElimRecError("Debes seleccionar al menos una franja horaria.");
      return;
    }

    setElimRecLoading(true);

    // Generar fechas que coincidan con los días seleccionados
    const fin = new Date(`${elimRecFechaFin}T12:00:00`);
    const fechas: string[] = [];
    const cursor = new Date(`${elimRecFechaInicio}T12:00:00`);
    while (cursor <= fin) {
      if (elimRecDias.includes(cursor.getDay())) {
        fechas.push(cursor.toISOString().split("T")[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (fechas.length === 0) {
      setElimRecError(
        "No hay fechas válidas con los días seleccionados en ese rango.",
      );
      setElimRecLoading(false);
      return;
    }

    // Construir los timestamps exactos a eliminar
    const iniciosAEliminar: string[] = [];
    for (const fecha of fechas) {
      for (const franja of franjasSeleccionadas) {
        const [inicioHora] = franja.split(" - ");
        iniciosAEliminar.push(`${fecha}T${inicioHora}:00`);
      }
    }

    // Eliminar en lotes de 100 (el filtro .in() tiene límites)
    let totalEliminadas = 0;
    const LOTE = 100;

    for (const pistaId of elimRecPistas) {
      for (let i = 0; i < iniciosAEliminar.length; i += LOTE) {
        const lote = iniciosAEliminar.slice(i, i + LOTE);
        const { error, count } = await supabase
          .from("reservas")
          .delete({ count: "exact" })
          .eq("pista_id", pistaId)
          .eq("estado", "libre")
          .in("inicio", lote);

        if (error) {
          setElimRecError(`Error al eliminar bloques: ${error.message}`);
          setElimRecLoading(false);
          return;
        }
        totalEliminadas += count ?? 0;
      }
    }

    setElimRecSuccess(
      `✅ ${totalEliminadas} bloque${totalEliminadas !== 1 ? "s" : ""} eliminado${totalEliminadas !== 1 ? "s" : ""} correctamente.`,
    );
    setElimRecLoading(false);

    // Recargar calendario del día visible
    const año = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const dia = date.getDate().toString().padStart(2, "0");
    const fechaStr = `${año}-${mes}-${dia}`;
    supabase
      .from("reservas")
      .select("*")
      .gte("inicio", `${fechaStr}T00:00:00`)
      .lt("inicio", `${fechaStr}T23:59:59`)
      .order("inicio", { ascending: true })
      .then(({ data }) => setReservasSupabase(data || []));
  };

  /* ----------------------------------------------------
    6.9) CREAR CLASE RECURRENTE
-----------------------------------------------------*/
  const handleCrearClaseRecurrente = async () => {
    setClaseRecError("");
    setClaseRecSuccess("");

    if (!claseRecPista) {
      setClaseRecError("Debes seleccionar una pista.");
      return;
    }
    if (claseRecDias.length === 0) {
      setClaseRecError("Debes seleccionar al menos un día de la semana.");
      return;
    }
    if (!claseRecFechaInicio || !claseRecFechaFin) {
      setClaseRecError("Debes seleccionar fecha de inicio y fin.");
      return;
    }
    if (claseRecFechaFin < claseRecFechaInicio) {
      setClaseRecError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }
    if (!claseRecMonitor) {
      setClaseRecError("Debes seleccionar un monitor.");
      return;
    }

    const franjasSeleccionadas = claseRecFranjas.filter((f) => f !== "");
    if (franjasSeleccionadas.length === 0) {
      setClaseRecError("Debes seleccionar al menos una franja horaria.");
      return;
    }

    // Comprobar solapamientos entre franjas seleccionadas
    const franjasParseadas = franjasSeleccionadas.map((f) => {
      const [ini, finH] = f.split(" - ");
      const [ih, im] = ini.split(":").map(Number);
      const [fh, fm] = finH.split(":").map(Number);
      return { ini: ih * 60 + im, fin: fh * 60 + fm, label: f };
    });

    for (let i = 0; i < franjasParseadas.length; i++) {
      for (let j = i + 1; j < franjasParseadas.length; j++) {
        const a = franjasParseadas[i];
        const b = franjasParseadas[j];
        if (a.ini < b.fin && b.ini < a.fin) {
          setClaseRecError(
            `Las franjas "${a.label}" y "${b.label}" se solapan. Corrígelas antes de continuar.`,
          );
          return;
        }
      }
    }

    setClaseRecLoading(true);

    // Generar fechas que coincidan con los días seleccionados
    const fin = new Date(`${claseRecFechaFin}T12:00:00`);
    const fechas: string[] = [];
    const cursor = new Date(`${claseRecFechaInicio}T12:00:00`);
    while (cursor <= fin) {
      if (claseRecDias.includes(cursor.getDay())) {
        fechas.push(cursor.toISOString().split("T")[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (fechas.length === 0) {
      setClaseRecError(
        "No hay fechas válidas con los días seleccionados en ese rango.",
      );
      setClaseRecLoading(false);
      return;
    }

    // Buscar reservas existentes para detectar solapamientos
    const { data: reservasExistentes, error: errorConsulta } = await supabase
      .from("reservas")
      .select("pista_id, inicio, fin")
      .eq("pista_id", claseRecPista)
      .gte("inicio", `${claseRecFechaInicio}T00:00:00`)
      .lte("inicio", `${claseRecFechaFin}T23:59:59`);

    if (errorConsulta) {
      setClaseRecError("Error al consultar reservas existentes.");
      setClaseRecLoading(false);
      return;
    }

    // Generar inserts evitando solapamientos
    const inserts: {
      pista_id: number;
      estado: string;
      inicio: string;
      fin: string;
      user_id: string;
    }[] = [];

    for (const fecha of fechas) {
      const reservasEstaFecha = (reservasExistentes || []).filter((r) => {
        const fechaR = new Date(r.inicio).toISOString().split("T")[0];
        return fechaR === fecha;
      });

      for (const franja of franjasSeleccionadas) {
        const [inicioHora, finHora] = franja.split(" - ");
        const [ih, im] = inicioHora.split(":").map(Number);
        const [fh, fm] = finHora.split(":").map(Number);
        const franjaIni = ih * 60 + im;
        const franjaFin = fh * 60 + fm;

        const solapa = reservasEstaFecha.some((r) => {
          const horaInicioR = new Date(r.inicio).toTimeString().slice(0, 5);
          const horaFinR = new Date(r.fin).toTimeString().slice(0, 5);
          const [rih, rim] = horaInicioR.split(":").map(Number);
          const [rfh, rfm] = horaFinR.split(":").map(Number);
          const resIni = rih * 60 + rim;
          const resFin = rfh * 60 + rfm;
          return franjaIni < resFin && resIni < franjaFin;
        });

        if (!solapa) {
          inserts.push({
            pista_id: claseRecPista as number,
            estado: "clase",
            inicio: `${fecha}T${inicioHora}:00`,
            fin: `${fecha}T${finHora}:00`,
            user_id: claseRecMonitor as string,
          });
        }
      }
    }

    if (inserts.length === 0) {
      setClaseRecError(
        "No hay clases nuevas que crear. Todos los horarios ya están ocupados.",
      );
      setClaseRecLoading(false);
      return;
    }

    const LOTE = 500;
    for (let i = 0; i < inserts.length; i += LOTE) {
      const lote = inserts.slice(i, i + LOTE);
      const { error: errorInsert } = await supabase
        .from("reservas")
        .insert(lote);
      if (errorInsert) {
        setClaseRecError(`Error al insertar clases: ${errorInsert.message}`);
        setClaseRecLoading(false);
        return;
      }
    }

    setClaseRecSuccess(
      `✅ ${inserts.length} clase${inserts.length !== 1 ? "s" : ""} creada${inserts.length !== 1 ? "s" : ""} correctamente.`,
    );
    setClaseRecLoading(false);

    const año = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const dia = date.getDate().toString().padStart(2, "0");
    const fechaStr = `${año}-${mes}-${dia}`;
    supabase
      .from("reservas")
      .select("*")
      .gte("inicio", `${fechaStr}T00:00:00`)
      .lt("inicio", `${fechaStr}T23:59:59`)
      .order("inicio", { ascending: true })
      .then(({ data }) => setReservasSupabase(data || []));
  };

  /* ----------------------------------------------------
    6.10) ELIMINAR CLASE RECURRENTE
-----------------------------------------------------*/
  const handleEliminarClaseRecurrente = async () => {
    setElimClaseRecError("");
    setElimClaseRecSuccess("");

    if (!elimClaseRecPista) {
      setElimClaseRecError("Debes seleccionar una pista.");
      return;
    }
    if (elimClaseRecDias.length === 0) {
      setElimClaseRecError("Debes seleccionar al menos un día de la semana.");
      return;
    }
    if (!elimClaseRecFechaInicio || !elimClaseRecFechaFin) {
      setElimClaseRecError("Debes seleccionar fecha de inicio y fin.");
      return;
    }
    if (elimClaseRecFechaFin < elimClaseRecFechaInicio) {
      setElimClaseRecError(
        "La fecha de fin debe ser posterior a la de inicio.",
      );
      return;
    }

    const franjasSeleccionadas = elimClaseRecFranjas.filter((f) => f !== "");
    if (franjasSeleccionadas.length === 0) {
      setElimClaseRecError("Debes seleccionar al menos una franja horaria.");
      return;
    }
    if (!elimClaseRecMonitor) {
      setElimClaseRecError("Debes seleccionar un monitor.");
      return;
    }

    setElimClaseRecLoading(true);

    // Generar fechas que coincidan con los días seleccionados
    const fin = new Date(`${elimClaseRecFechaFin}T12:00:00`);
    const fechas: string[] = [];
    const cursor = new Date(`${elimClaseRecFechaInicio}T12:00:00`);
    while (cursor <= fin) {
      if (elimClaseRecDias.includes(cursor.getDay())) {
        fechas.push(cursor.toISOString().split("T")[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (fechas.length === 0) {
      setElimClaseRecError(
        "No hay fechas válidas con los días seleccionados en ese rango.",
      );
      setElimClaseRecLoading(false);
      return;
    }

    // Construir los timestamps exactos a eliminar
    const iniciosAEliminar: string[] = [];
    for (const fecha of fechas) {
      for (const franja of franjasSeleccionadas) {
        const [inicioHora] = franja.split(" - ");
        iniciosAEliminar.push(`${fecha}T${inicioHora}:00`);
      }
    }

    // Eliminar en lotes de 100
    let totalEliminadas = 0;
    const LOTE = 100;

    for (let i = 0; i < iniciosAEliminar.length; i += LOTE) {
      const lote = iniciosAEliminar.slice(i, i + LOTE);
      const { error, count } = await supabase
        .from("reservas")
        .delete({ count: "exact" })
        .eq("pista_id", elimClaseRecPista)
        .eq("estado", "clase")
        .eq("user_id", elimClaseRecMonitor)
        .in("inicio", lote);

      if (error) {
        setElimClaseRecError(`Error al eliminar clases: ${error.message}`);
        setElimClaseRecLoading(false);
        return;
      }
      totalEliminadas += count ?? 0;
    }

    setElimClaseRecSuccess(
      `✅ ${totalEliminadas} clase${totalEliminadas !== 1 ? "s" : ""} eliminada${totalEliminadas !== 1 ? "s" : ""} correctamente.`,
    );
    setElimClaseRecLoading(false);

    const año = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const dia = date.getDate().toString().padStart(2, "0");
    const fechaStr = `${año}-${mes}-${dia}`;
    supabase
      .from("reservas")
      .select("*")
      .gte("inicio", `${fechaStr}T00:00:00`)
      .lt("inicio", `${fechaStr}T23:59:59`)
      .order("inicio", { ascending: true })
      .then(({ data }) => setReservasSupabase(data || []));
  };

  /* ----------------------------------------------------
      7) RENDER
  -----------------------------------------------------*/
  // if (pistasDB.length === 0 && !errorPistas) {
  //   return <div className="cargando">Cargando pistas...</div>;
  // }

  // if (errorPistas) {
  //   return (
  //     <div className="cargando">Error cargando pistas. Recarga la página.</div>
  //   );
  // }

  if (pistasDB.length === 0 && !errorPistas) {
    return <div className="cargando">Cargando pistas...</div>;
  }

  if (errorPistas) {
    return (
      <div className="cargando">Error cargando pistas. Recarga la página.</div>
    );
  }

  return (
    <>
      {/* OVERLAY PRINCIPAL */}
      <div
        onClick={() => setShowOverlay(false)}
        className={`reserva_overlay ${showOverlay ? "show" : ""}`}
      >
        <div
          className="reservas_contenido"
          onClick={(e) => e.stopPropagation()}
        >
          {bloqueSeleccionado ? (
            <div className="div_confirmar_reserva">
              {/* cancelOverlay && <h2>¿Quieres cancelar esta pista?</h2> */}
              {cancelClaseOverlay && <h2>¿Quieres cancelar esta clase?</h2>}

              {bloqueSeleccionado.user_id && (
                <div>
                  {bloqueSeleccionado.estado === "clase" ? (
                    <h2>
                      Monitor:{" "}
                      {
                        perfiles.find(
                          (p) => p.id === bloqueSeleccionado.user_id,
                        )?.first_name
                      }{" "}
                      {
                        perfiles.find(
                          (p) => p.id === bloqueSeleccionado.user_id,
                        )?.last_name
                      }
                    </h2>
                  ) : (
                    <>
                      <h2>
                        {
                          perfiles.find(
                            (p) => p.id === bloqueSeleccionado.user_id,
                          )?.first_name
                        }{" "}
                        {
                          perfiles.find(
                            (p) => p.id === bloqueSeleccionado.user_id,
                          )?.last_name
                        }
                      </h2>
                      <h2>
                        {
                          perfiles.find(
                            (p) => p.id === bloqueSeleccionado.user_id,
                          )?.email
                        }
                      </h2>
                      <h2>
                        tlf:{" "}
                        {
                          perfiles.find(
                            (p) => p.id === bloqueSeleccionado.user_id,
                          )?.tlf
                        }
                      </h2>
                    </>
                  )}
                </div>
              )}
              {!bloqueSeleccionado.user_id &&
                bloqueSeleccionado.invitado_nombre && (
                  <div>
                    <h2>👤 {bloqueSeleccionado.invitado_nombre}</h2>
                    {bloqueSeleccionado.invitado_tlf && (
                      <h2>tlf: {bloqueSeleccionado.invitado_tlf}</h2>
                    )}
                  </div>
                )}
              <div className="admin_div_info_reserva">
                <h2>
                  {date
                    .toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                    .replace(/^./, (c) => c.toUpperCase())}
                </h2>
                <h2>
                  {bloqueSeleccionado.inicio} - {bloqueSeleccionado.fin}
                </h2>
                <h2>Pista {bloqueSeleccionado.pista}</h2>
              </div>

              {/* SECCIÓN PAGADO (solo en ocupada) */}
              {cancelOverlay && (
                <div className="admin_pagado_section">
                  <p className="admin_pagado_titulo">Pagado</p>
                  <div className="admin_pagado_checkboxes">
                    {(
                      [
                        "Jugador 1",
                        "Jugador 2",
                        "Jugador 3",
                        "Jugador 4",
                      ] as const
                    ).map((label, i) => (
                      <label key={i} className="admin_pagado_label">
                        <input
                          type="checkbox"
                          className="admin_pagado_checkbox"
                          checked={pagados[i as 0 | 1 | 2 | 3]}
                          onChange={(e) =>
                            handleTogglePagado(
                              i as 0 | 1 | 2 | 3,
                              e.target.checked,
                            )
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN PRODUCTOS (solo en ocupada) */}
              {cancelOverlay && (
                <div className="admin_productos_section">
                  <p className="admin_productos_titulo">Productos</p>

                  <div className="admin_productos_botones">
                    {PRODUCTOS.map(({ key, label }) => (
                      <button
                        key={key}
                        className="admin_producto_add_btn"
                        onClick={() => handleAñadirProducto(key)}
                      >
                        + {label}
                      </button>
                    ))}
                  </div>

                  {pedidosLoading ? (
                    <p style={{ textAlign: "center", color: "white" }}>
                      Cargando...
                    </p>
                  ) : pedidos.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "18px",
                      }}
                    >
                      Sin productos añadidos
                    </p>
                  ) : (
                    <div className="admin_productos_lista">
                      {pedidos.map((pedido) => (
                        <div
                          key={pedido.id}
                          className={`admin_producto_fila ${pedido.pagado ? "pagado" : ""}`}
                        >
                          <span className="admin_producto_nombre">
                            {
                              PRODUCTOS.find((p) => p.key === pedido.producto)
                                ?.label
                            }
                          </span>

                          <label className="admin_producto_pagado_label">
                            <input
                              type="checkbox"
                              className="admin_producto_pagado_checkbox"
                              checked={pedido.pagado}
                              onChange={(e) =>
                                handleTogglePedidoPagado(
                                  pedido,
                                  e.target.checked,
                                )
                              }
                            />
                            <span>Pagado</span>
                          </label>

                          <button
                            className="admin_producto_cantidad_btn"
                            onClick={() => handleReducirProducto(pedido)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SELECT DE USUARIO (solo en bloque libre) */}
              {!cancelOverlay && !cancelClaseOverlay && (
                <div className="admin_elegir_usuario">
                  <div className="admin_modo_toggle">
                    <button
                      className={`admin_modo_btn ${!modoInvitado ? "activo" : ""}`}
                      onClick={() => {
                        setModoInvitado(false);
                        setInvitadoNombre("");
                        setInvitadoTlf("");
                      }}
                    >
                      Usuario registrado
                    </button>
                    <button
                      className={`admin_modo_btn ${modoInvitado ? "activo" : ""}`}
                      onClick={() => {
                        setModoInvitado(true);
                        setUsuarioSeleccionado(null);
                        setBusquedaUsuario("");
                      }}
                    >
                      Invitado
                    </button>
                  </div>

                  {!modoInvitado ? (
                    <div className="admin_buscador_usuario">
                      <input
                        type="text"
                        className="admin_elegir_usuario_select"
                        placeholder="Buscar usuario por nombre..."
                        value={
                          usuarioSeleccionado
                            ? (() => {
                                const p = perfiles.find(
                                  (p) => p.id === usuarioSeleccionado,
                                );
                                return p
                                  ? `${p.first_name} ${p.last_name} – ${p.email}`
                                  : busquedaUsuario;
                              })()
                            : busquedaUsuario
                        }
                        onChange={(e) => {
                          setBusquedaUsuario(e.target.value);
                          setUsuarioSeleccionado(null);
                        }}
                      />
                      {!usuarioSeleccionado && busquedaUsuario.length > 0 && (
                        <div className="admin_buscador_lista">
                          {perfiles
                            .filter((p) =>
                              `${p.first_name} ${p.last_name}`
                                .toLowerCase()
                                .includes(busquedaUsuario.toLowerCase()),
                            )
                            .slice(0, 8)
                            .map((p) => (
                              <div
                                key={p.id}
                                className="admin_buscador_opcion"
                                onClick={() => {
                                  setUsuarioSeleccionado(p.id);
                                  setBusquedaUsuario("");
                                }}
                              >
                                {p.first_name} {p.last_name} – {p.email}
                              </div>
                            ))}
                          {perfiles.filter((p) =>
                            `${p.first_name} ${p.last_name}`
                              .toLowerCase()
                              .includes(busquedaUsuario.toLowerCase()),
                          ).length === 0 && (
                            <div className="admin_buscador_opcion admin_buscador_vacio">
                              Sin resultados
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="admin_invitado_form">
                      <input
                        type="text"
                        className="admin_elegir_usuario_select"
                        placeholder="Nombre del invitado *"
                        value={invitadoNombre}
                        onChange={(e) => setInvitadoNombre(e.target.value)}
                      />
                      <input
                        type="tel"
                        className="admin_elegir_usuario_select admin_invitado_tlf"
                        placeholder="Teléfono (opcional)"
                        value={invitadoTlf}
                        onChange={(e) => setInvitadoTlf(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>Error al cargar el bloque</p>
          )}

          {errorMsg && <p className="reserva_error grande">{errorMsg}</p>}
          {successMsg && <p className="reserva_success grande">{successMsg}</p>}

          <div className="div_confirmar_reserva_botones">
            <button
              className="reserva_boton"
              id="reserva_boton_cerrar"
              onClick={() => setShowOverlay(false)}
            >
              Atrás
            </button>

            {/* Cancelar CLASE */}
            {cancelClaseOverlay && (
              <button className="reserva_boton" onClick={handleCancelarReserva}>
                Cancelar clase
              </button>
            )}

            {/* Cancelar RESERVA normal */}
            {!cancelClaseOverlay && cancelOverlay && (
              <button
                className="reserva_boton"
                onClick={() => setshowOverlayConfirmacion(true)}
              >
                Cancelar pista
              </button>
            )}

            {/* Confirmar reserva (bloque libre) */}
            {!cancelClaseOverlay && !cancelOverlay && (
              <>
                <button
                  className="reserva_boton"
                  id="admin_reserva_boton_confirmar"
                  onClick={handleConfirmarReserva}
                  disabled={
                    modoInvitado ? !invitadoNombre.trim() : !usuarioSeleccionado
                  }
                >
                  Confirmar reserva
                </button>
                <button
                  className="reserva_boton"
                  id="admin_reserva_boton_confirmar"
                  onClick={handleEliminarBloque}
                >
                  Eliminar bloque
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY: CONFIRMAR CANCELACIÓN */}
      {showOverlayConfirmacion && (
        <div
          className="reserva_overlay show"
          onClick={() => setshowOverlayConfirmacion(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>
                ⚠️ <strong>Confirmar cancelación</strong> ⚠️
              </h2>
              <h2>¿Seguro que quieres cancelar esta pista?</h2>

              {bloqueSeleccionado?.user_id && (
                <div>
                  <h2>
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.first_name
                    }{" "}
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.last_name
                    }
                  </h2>
                  <h2>
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.email
                    }
                  </h2>
                  <h2>
                    tlf:{" "}
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.tlf
                    }
                  </h2>
                </div>
              )}

              <div className="admin_div_info_reserva">
                <h2>
                  {date
                    .toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                    .replace(/^./, (c) => c.toUpperCase())}
                </h2>
                <h2>
                  {bloqueSeleccionado?.inicio} - {bloqueSeleccionado?.fin}
                </h2>
                <h2>Pista {bloqueSeleccionado?.pista}</h2>
              </div>
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setshowOverlayConfirmacion(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton reserva_boton_peligro"
                onClick={() => {
                  setshowOverlayConfirmacion(false);
                  handleCancelarReserva();
                }}
              >
                Sí, cancelar pista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY CREAR BLOQUE */}
      {showOverlayCrearBloque && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayCrearBloque(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Crear bloque pista libre</h2>

              <input
                type="date"
                className="admin_elegir_usuario_select"
                value={fechaBloqueSeleccionada}
                min={todayISO}
                onChange={(e) => setFechaBloqueSeleccionada(e.target.value)}
              />

              <select
                className="admin_elegir_usuario_select"
                value={franjaSeleccionada}
                onChange={(e) => setFranjaSeleccionada(e.target.value)}
              >
                <option value="">Selecciona horario</option>
                {franjasHorarias.map((f, i) => (
                  <option key={i} value={`${f.inicio} - ${f.fin}`}>
                    {f.inicio} - {f.fin}
                  </option>
                ))}
              </select>

              <select
                className="admin_elegir_usuario_select"
                id="admin_elegir_usuario_select_ultimo"
                value={pistaSeleccionada}
                onChange={(e) => setPistaSeleccionada(Number(e.target.value))}
              >
                <option value="">Selecciona pista</option>
                {pistasDB.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              {crearBloqueError && (
                <p className="reserva_error grande">{crearBloqueError}</p>
              )}
              {crearBloqueSuccess && (
                <p className="reserva_success grande">{crearBloqueSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayCrearBloque(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton"
                onClick={handleCrearBloquePista}
              >
                Crear bloque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY CREAR CLASE */}
      {showOverlayCrearClase && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayCrearClase(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Reservar clase</h2>

              <input
                type="date"
                className="admin_elegir_usuario_select"
                value={fechaClaseSeleccionada}
                min={todayISO}
                onChange={(e) => setFechaClaseSeleccionada(e.target.value)}
              />

              <select
                className="admin_elegir_usuario_select"
                value={franjaClaseSeleccionada}
                onChange={(e) => setFranjaClaseSeleccionada(e.target.value)}
              >
                <option value="">Selecciona horario</option>
                {franjasHorariasClase.map((f, i) => (
                  <option key={i} value={`${f.inicio} - ${f.fin}`}>
                    {f.inicio} - {f.fin}
                  </option>
                ))}
              </select>

              <select
                className="admin_elegir_usuario_select"
                value={pistaClaseSeleccionada}
                onChange={(e) =>
                  setPistaClaseSeleccionada(Number(e.target.value))
                }
              >
                <option value="">Selecciona pista</option>
                {pistasDB.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              <select
                className="admin_elegir_usuario_select"
                id="admin_elegir_usuario_select_ultimo"
                value={monitorSeleccionado}
                onChange={(e) => setMonitorSeleccionado(e.target.value)}
              >
                <option value="">Selecciona monitor</option>
                {monitores.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>

              {crearClaseError && (
                <p className="reserva_error grande">{crearClaseError}</p>
              )}
              {crearClaseSuccess && (
                <p className="reserva_success grande">{crearClaseSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayCrearClase(false)}
              >
                Atrás
              </button>
              <button className="reserva_boton" onClick={handleCrearClase}>
                Reservar clase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TORNEO */}
      {showOverlayTorneo && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayTorneo(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Bloquear fin de semana — Torneo</h2>

              <div className="admin_torneo_form">
                <label className="admin_torneo_label">Inicio del torneo</label>
                <div className="admin_torneo_fila">
                  <input
                    type="date"
                    className="admin_elegir_usuario_select admin_torneo_input_fecha"
                    value={torneoFechaInicio}
                    onChange={(e) => setTorneoFechaInicio(e.target.value)}
                  />
                  <input
                    type="time"
                    className="admin_elegir_usuario_select admin_torneo_input_hora"
                    value={torneoHoraInicio}
                    onChange={(e) => setTorneoHoraInicio(e.target.value)}
                  />
                </div>

                <label className="admin_torneo_label">Fin del torneo</label>
                <div className="admin_torneo_fila">
                  <input
                    type="date"
                    className="admin_elegir_usuario_select admin_torneo_input_fecha"
                    value={torneoFechaFin}
                    onChange={(e) => setTorneoFechaFin(e.target.value)}
                  />
                  <input
                    type="time"
                    className="admin_elegir_usuario_select admin_torneo_input_hora"
                    value={torneoHoraFin}
                    onChange={(e) => setTorneoHoraFin(e.target.value)}
                  />
                </div>
              </div>

              {torneoError && (
                <p
                  className="reserva_error grande"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {torneoError}
                </p>
              )}
              {torneoSuccess && (
                <p className="reserva_success grande">{torneoSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayTorneo(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton"
                onClick={handleBloquearTorneo}
                disabled={torneoLoading}
              >
                {torneoLoading ? "Procesando..." : "Bloquear torneo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY PISTA FIJA */}
      {showOverlayPistaFija && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayPistaFija(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Asignar pista fija</h2>

              {/* BUSCADOR USUARIO */}
              <div className="admin_elegir_usuario">
                <div className="admin_buscador_usuario">
                  <input
                    type="text"
                    className="admin_elegir_usuario_select"
                    placeholder="Buscar usuario por nombre..."
                    value={
                      fijaUsuario
                        ? (() => {
                            const p = perfiles.find(
                              (p) => p.id === fijaUsuario,
                            );
                            return p
                              ? `${p.first_name} ${p.last_name} – ${p.email}`
                              : fijaBusqueda;
                          })()
                        : fijaBusqueda
                    }
                    onChange={(e) => {
                      setFijaBusqueda(e.target.value);
                      setFijaUsuario(null);
                    }}
                  />
                  {!fijaUsuario && fijaBusqueda.length > 0 && (
                    <div className="admin_buscador_lista">
                      {perfiles
                        .filter((p) =>
                          `${p.first_name} ${p.last_name}`
                            .toLowerCase()
                            .includes(fijaBusqueda.toLowerCase()),
                        )
                        .slice(0, 8)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="admin_buscador_opcion"
                            onClick={() => {
                              setFijaUsuario(p.id);
                              setFijaBusqueda("");
                            }}
                          >
                            {p.first_name} {p.last_name} – {p.email}
                          </div>
                        ))}
                      {perfiles.filter((p) =>
                        `${p.first_name} ${p.last_name}`
                          .toLowerCase()
                          .includes(fijaBusqueda.toLowerCase()),
                      ).length === 0 && (
                        <div className="admin_buscador_opcion admin_buscador_vacio">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* PISTA */}
              <select
                className="admin_elegir_usuario_select"
                value={fijaPista}
                onChange={(e) => setFijaPista(Number(e.target.value))}
              >
                <option value="">Selecciona pista</option>
                {pistasDB.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              {/* FRANJA */}
              <select
                className="admin_elegir_usuario_select"
                value={fijaFranja}
                onChange={(e) => setFijaFranja(e.target.value)}
              >
                <option value="">Selecciona horario</option>
                {franjasHorarias.map((f, i) => (
                  <option key={i} value={`${f.inicio} - ${f.fin}`}>
                    {f.inicio} - {f.fin}
                  </option>
                ))}
              </select>

              {/* DÍA DE LA SEMANA */}
              <select
                className="admin_elegir_usuario_select"
                value={fijaDiaSemana}
                onChange={(e) => setFijaDiaSemana(Number(e.target.value))}
              >
                <option value="">Selecciona día de la semana</option>
                <option value={1}>Lunes</option>
                <option value={2}>Martes</option>
                <option value={3}>Miércoles</option>
                <option value={4}>Jueves</option>
                <option value={5}>Viernes</option>
                <option value={6}>Sábado</option>
                <option value={0}>Domingo</option>
              </select>

              {/* FECHAS */}
              <div className="admin_torneo_form">
                <label className="admin_torneo_label">Fecha inicio</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={fijaFechaInicio}
                  onChange={(e) => {
                    setFijaFechaInicio(e.target.value);
                    setFijaFechaFin("");
                  }}
                />
                <label className="admin_torneo_label">Fecha fin</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={fijaFechaFin}
                  min={fijaFechaInicio}
                  onChange={(e) => setFijaFechaFin(e.target.value)}
                />
              </div>

              {/* AVISOS */}
              {fijaAvisos.length > 0 && (
                <div className="admin_fija_avisos">
                  <p className="admin_fija_avisos_titulo">⚠️ Avisos</p>
                  {fijaAvisos.map((aviso, i) => (
                    <p key={i} className="admin_fija_aviso_item">
                      {aviso}
                    </p>
                  ))}
                </div>
              )}

              {fijaError && <p className="reserva_error grande">{fijaError}</p>}
              {fijaSuccess && (
                <p className="reserva_success grande">{fijaSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayPistaFija(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton"
                onClick={handleAsignarPistaFija}
                disabled={
                  fijaLoading ||
                  !fijaUsuario ||
                  !fijaPista ||
                  !fijaFranja ||
                  !fijaFechaInicio ||
                  !fijaFechaFin ||
                  fijaDiaSemana === ""
                }
              >
                {fijaLoading ? "Procesando..." : "Asignar pista fija"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY CREAR BLOQUE RECURRENTE */}
      {showOverlayRecurrente && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayRecurrente(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Crear bloque pista — Recurrente</h2>

              {/* PISTAS */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Pistas</p>
                <div className="admin_cal_checkboxes">
                  {pistasDB.map((p) => (
                    <label key={p.id} className="admin_cal_check_label">
                      <input
                        type="checkbox"
                        className="admin_pagado_checkbox"
                        checked={recPistas.includes(p.id)}
                        onChange={(e) => {
                          setRecPistas((prev) =>
                            e.target.checked
                              ? [...prev, p.id]
                              : prev.filter((id) => id !== p.id),
                          );
                        }}
                      />
                      <span>{p.nombre.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* DÍAS DE LA SEMANA */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Días de la semana</p>
                <div className="admin_cal_checkboxes">
                  {[
                    { label: "Lunes", value: 1 },
                    { label: "Martes", value: 2 },
                    { label: "Miércoles", value: 3 },
                    { label: "Jueves", value: 4 },
                    { label: "Viernes", value: 5 },
                    { label: "Sábado", value: 6 },
                    { label: "Domingo", value: 0 },
                  ].map((d) => (
                    <label key={d.value} className="admin_cal_check_label">
                      <input
                        type="checkbox"
                        className="admin_pagado_checkbox"
                        checked={recDias.includes(d.value)}
                        onChange={(e) => {
                          setRecDias((prev) =>
                            e.target.checked
                              ? [...prev, d.value]
                              : prev.filter((v) => v !== d.value),
                          );
                        }}
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* FECHAS */}
              <div className="admin_torneo_form">
                <label className="admin_torneo_label">Fecha inicio</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={recFechaInicio}
                  onChange={(e) => setRecFechaInicio(e.target.value)}
                />
                <label className="admin_torneo_label">Fecha fin</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={recFechaFin}
                  min={recFechaInicio}
                  onChange={(e) => setRecFechaFin(e.target.value)}
                />
              </div>

              {/* FRANJAS */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Franjas horarias</p>
                <div className="admin_cal_franjas">
                  {" "}
                  {recFranjas.map((franja, i) => (
                    <select
                      key={i}
                      className="admin_cal_franja_select"
                      value={franja}
                      onChange={(e) => {
                        const nuevas = [...recFranjas];
                        nuevas[i] = e.target.value;
                        setRecFranjas(nuevas);
                      }}
                    >
                      <option value="">— vacía —</option>
                      {franjasHorarias.map((f, j) => (
                        <option key={j} value={`${f.inicio} - ${f.fin}`}>
                          {f.inicio} - {f.fin}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>{" "}
              </div>

              {recError && <p className="reserva_error grande">{recError}</p>}
              {recSuccess && (
                <p className="reserva_success grande">{recSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayRecurrente(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton"
                onClick={handleCrearBloqueRecurrente}
                disabled={recLoading}
              >
                {recLoading ? "Generando..." : "Crear bloques"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY ELIMINAR BLOQUE RECURRENTE */}
      {showOverlayEliminarRec && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayEliminarRec(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Eliminar bloque pista — Recurrente</h2>

              {/* PISTAS */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Pistas</p>
                <div className="admin_cal_checkboxes">
                  {pistasDB.map((p) => (
                    <label key={p.id} className="admin_cal_check_label">
                      <input
                        type="checkbox"
                        className="admin_pagado_checkbox"
                        checked={elimRecPistas.includes(p.id)}
                        onChange={(e) => {
                          setElimRecPistas((prev) =>
                            e.target.checked
                              ? [...prev, p.id]
                              : prev.filter((id) => id !== p.id),
                          );
                        }}
                      />
                      <span>{p.nombre.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* DÍAS DE LA SEMANA */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Días de la semana</p>
                <div className="admin_cal_checkboxes">
                  {[
                    { label: "Lunes", value: 1 },
                    { label: "Martes", value: 2 },
                    { label: "Miércoles", value: 3 },
                    { label: "Jueves", value: 4 },
                    { label: "Viernes", value: 5 },
                    { label: "Sábado", value: 6 },
                    { label: "Domingo", value: 0 },
                  ].map((d) => (
                    <label key={d.value} className="admin_cal_check_label">
                      <input
                        type="checkbox"
                        className="admin_pagado_checkbox"
                        checked={elimRecDias.includes(d.value)}
                        onChange={(e) => {
                          setElimRecDias((prev) =>
                            e.target.checked
                              ? [...prev, d.value]
                              : prev.filter((v) => v !== d.value),
                          );
                        }}
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* FECHAS */}
              <div className="admin_torneo_form">
                <label className="admin_torneo_label">Fecha inicio</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={elimRecFechaInicio}
                  onChange={(e) => setElimRecFechaInicio(e.target.value)}
                />
                <label className="admin_torneo_label">Fecha fin</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={elimRecFechaFin}
                  min={elimRecFechaInicio}
                  onChange={(e) => setElimRecFechaFin(e.target.value)}
                />
              </div>

              {/* FRANJAS */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Franjas horarias a eliminar</p>
                <div className="admin_cal_franjas">
                  {elimRecFranjas.map((franja, i) => (
                    <select
                      key={i}
                      className="admin_cal_franja_select"
                      value={franja}
                      onChange={(e) => {
                        const nuevas = [...elimRecFranjas];
                        nuevas[i] = e.target.value;
                        setElimRecFranjas(nuevas);
                      }}
                    >
                      <option value="">— vacía —</option>
                      {franjasHorarias.map((f, j) => (
                        <option key={j} value={`${f.inicio} - ${f.fin}`}>
                          {f.inicio} - {f.fin}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              {elimRecError && (
                <p className="reserva_error grande">{elimRecError}</p>
              )}
              {elimRecSuccess && (
                <p className="reserva_success grande">{elimRecSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayEliminarRec(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton"
                onClick={handleEliminarBloqueRecurrente}
                disabled={elimRecLoading}
              >
                {elimRecLoading ? "Eliminando..." : "Eliminar bloques"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY CREAR CLASE RECURRENTE */}
      {showOverlayCrearClaseRec && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayCrearClaseRec(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Reservar clase — Recurrente</h2>

              {/* PISTA */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Pista</p>
                <select
                  className="admin_elegir_usuario_select"
                  value={claseRecPista}
                  onChange={(e) => setClaseRecPista(Number(e.target.value))}
                >
                  <option value="">Selecciona pista</option>
                  {pistasDB.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* MONITOR */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Monitor</p>
                <select
                  className="admin_elegir_usuario_select"
                  value={claseRecMonitor}
                  onChange={(e) => setClaseRecMonitor(e.target.value)}
                >
                  <option value="">Selecciona monitor</option>
                  {monitores.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DÍAS DE LA SEMANA */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Días de la semana</p>
                <div className="admin_cal_checkboxes">
                  {[
                    { label: "Lunes", value: 1 },
                    { label: "Martes", value: 2 },
                    { label: "Miércoles", value: 3 },
                    { label: "Jueves", value: 4 },
                    { label: "Viernes", value: 5 },
                    { label: "Sábado", value: 6 },
                    { label: "Domingo", value: 0 },
                  ].map((d) => (
                    <label key={d.value} className="admin_cal_check_label">
                      <input
                        type="checkbox"
                        className="admin_pagado_checkbox"
                        checked={claseRecDias.includes(d.value)}
                        onChange={(e) => {
                          setClaseRecDias((prev) =>
                            e.target.checked
                              ? [...prev, d.value]
                              : prev.filter((v) => v !== d.value),
                          );
                        }}
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* FECHAS */}
              <div className="admin_torneo_form">
                <label className="admin_torneo_label">Fecha inicio</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={claseRecFechaInicio}
                  onChange={(e) => setClaseRecFechaInicio(e.target.value)}
                />
                <label className="admin_torneo_label">Fecha fin</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={claseRecFechaFin}
                  min={claseRecFechaInicio}
                  onChange={(e) => setClaseRecFechaFin(e.target.value)}
                />
              </div>

              {/* FRANJAS */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Franjas horarias (1h)</p>
                <div className="admin_cal_franjas">
                  {claseRecFranjas.map((franja, i) => (
                    <select
                      key={i}
                      className="admin_cal_franja_select"
                      value={franja}
                      onChange={(e) => {
                        const nuevas = [...claseRecFranjas];
                        nuevas[i] = e.target.value;
                        setClaseRecFranjas(nuevas);
                      }}
                    >
                      <option value="">— vacía —</option>
                      {franjasHorariasClase.map((f, j) => (
                        <option key={j} value={`${f.inicio} - ${f.fin}`}>
                          {f.inicio} - {f.fin}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              {claseRecError && (
                <p className="reserva_error grande">{claseRecError}</p>
              )}
              {claseRecSuccess && (
                <p className="reserva_success grande">{claseRecSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayCrearClaseRec(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton"
                onClick={handleCrearClaseRecurrente}
                disabled={claseRecLoading}
              >
                {claseRecLoading ? "Generando..." : "Crear clases"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY ELIMINAR CLASE RECURRENTE */}
      {showOverlayEliminarClaseRec && (
        <div
          className="reserva_overlay show"
          onClick={() => setShowOverlayEliminarClaseRec(false)}
        >
          <div
            className="reservas_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="div_confirmar_reserva">
              <h2>Eliminar clase — Recurrente</h2>

              {/* PISTA */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Pista</p>
                <select
                  className="admin_elegir_usuario_select"
                  value={elimClaseRecPista}
                  onChange={(e) => setElimClaseRecPista(Number(e.target.value))}
                >
                  <option value="">Selecciona pista</option>
                  {pistasDB.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* MONITOR */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Monitor</p>
                <select
                  className="admin_elegir_usuario_select"
                  value={elimClaseRecMonitor}
                  onChange={(e) => setElimClaseRecMonitor(e.target.value)}
                >
                  <option value="">Selecciona monitor</option>
                  {monitores.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DÍAS DE LA SEMANA */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">Días de la semana</p>
                <div className="admin_cal_checkboxes">
                  {[
                    { label: "Lunes", value: 1 },
                    { label: "Martes", value: 2 },
                    { label: "Miércoles", value: 3 },
                    { label: "Jueves", value: 4 },
                    { label: "Viernes", value: 5 },
                    { label: "Sábado", value: 6 },
                    { label: "Domingo", value: 0 },
                  ].map((d) => (
                    <label key={d.value} className="admin_cal_check_label">
                      <input
                        type="checkbox"
                        className="admin_pagado_checkbox"
                        checked={elimClaseRecDias.includes(d.value)}
                        onChange={(e) => {
                          setElimClaseRecDias((prev) =>
                            e.target.checked
                              ? [...prev, d.value]
                              : prev.filter((v) => v !== d.value),
                          );
                        }}
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* FECHAS */}
              <div className="admin_torneo_form">
                <label className="admin_torneo_label">Fecha inicio</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={elimClaseRecFechaInicio}
                  onChange={(e) => setElimClaseRecFechaInicio(e.target.value)}
                />
                <label className="admin_torneo_label">Fecha fin</label>
                <input
                  type="date"
                  className="admin_elegir_usuario_select"
                  value={elimClaseRecFechaFin}
                  min={elimClaseRecFechaInicio}
                  onChange={(e) => setElimClaseRecFechaFin(e.target.value)}
                />
              </div>

              {/* FRANJAS */}
              <div className="admin_cal_seccion">
                <p className="admin_cal_titulo">
                  Franjas horarias a eliminar (1h)
                </p>
                <div className="admin_cal_franjas">
                  {elimClaseRecFranjas.map((franja, i) => (
                    <select
                      key={i}
                      className="admin_cal_franja_select"
                      value={franja}
                      onChange={(e) => {
                        const nuevas = [...elimClaseRecFranjas];
                        nuevas[i] = e.target.value;
                        setElimClaseRecFranjas(nuevas);
                      }}
                    >
                      <option value="">— vacía —</option>
                      {franjasHorariasClase.map((f, j) => (
                        <option key={j} value={`${f.inicio} - ${f.fin}`}>
                          {f.inicio} - {f.fin}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              {elimClaseRecError && (
                <p className="reserva_error grande">{elimClaseRecError}</p>
              )}
              {elimClaseRecSuccess && (
                <p className="reserva_success grande">{elimClaseRecSuccess}</p>
              )}
            </div>

            <div className="div_confirmar_reserva_botones">
              <button
                className="reserva_boton"
                id="reserva_boton_cerrar"
                onClick={() => setShowOverlayEliminarClaseRec(false)}
              >
                Atrás
              </button>
              <button
                className="reserva_boton"
                onClick={handleEliminarClaseRecurrente}
                disabled={elimClaseRecLoading}
              >
                {elimClaseRecLoading ? "Eliminando..." : "Eliminar clases"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDARIO */}
      <section className="admin_section_reservar_pista">
        <div className="admin_div_calendario_pistas">
          {/* HEADER */}
          <div className="div_calendario_header">
            <div className="div_hora_columna_header">HORA</div>
            {pistasDB.map((p) => (
              <div key={p.id} className="div_pista_columna_header">
                <span className="nombre_pc">{p.nombre.replace(/_/g, " ")}</span>
                <span className="nombre_movil">{`P${p.id}`}</span>
              </div>
            ))}
          </div>

          {/* BODY */}
          <div className="admin_div_calendario_body">
            {horas.map((h) => (
              <div key={h} className="div_hora_celda" data-hora={h}>
                {h}
              </div>
            ))}

            {pistas.map((p, idx) =>
              todasLasReservas
                .filter((r) => r.pista === p)
                .map((bloque, i) => {
                  const filas = calcularFilasBloque(bloque.inicio, bloque.fin);
                  const esLibre = bloque.estado === "libre";
                  const esOcupada = bloque.estado === "ocupada";
                  const esClase = bloque.estado === "clase";
                  const esTorneo = bloque.estado === "torneo";

                  const todoPagado =
                    bloque.estado === "ocupada" &&
                    bloque.pagado_1 &&
                    bloque.pagado_2 &&
                    bloque.pagado_3 &&
                    bloque.pagado_4;

                  return (
                    <div
                      key={`${p}-${bloque.inicio}-${i}`}
                      className={`admin_div_reserva_bloque ${bloque.estado}${todoPagado ? " todo_pagado" : ""}`}
                      data-libres={esLibre ? "true" : "false"}
                      onClick={() => {
                        if (esLibre) handleClickLibre(bloque);
                        else if (esOcupada) handleClickOcupada(bloque);
                        else if (esClase) handleClickClase(bloque);
                      }}
                      style={{
                        gridColumn: idx + 2,
                        gridRow: `${calcularFila(bloque.inicio)} / span ${filas}`,
                      }}
                    >
                      {(esLibre || esOcupada || esClase) && (
                        <>
                          <span className="texto_reserva texto_reserva_pc">{`${bloque.inicio} - ${bloque.fin}`}</span>
                          <span className="texto_reserva texto_reserva_movil">
                            {bloque.inicio}
                          </span>
                        </>
                      )}
                      {esTorneo && (
                        <span className="texto_reserva">Torneo</span>
                      )}
                    </div>
                  );
                }),
            )}

            {pistas.map((p, idx) =>
              horas.map((h) => {
                if (estaCeldaOcupada(p, h)) return null;
                return (
                  <div
                    key={`${p}-${h}-vacia`}
                    className="div_celda_vacia"
                    style={{ gridColumn: idx + 2, gridRow: calcularFila(h) }}
                  />
                );
              }),
            )}
          </div>
        </div>
      </section>

      {/* BOTONES FUNCIONES */}
      <section className="admin_seccion_funciones">
        <button
          className="admin_seccion_funciones_boton"
          onClick={() => {
            setShowOverlayCrearBloque(true);
            setCrearBloqueError("");
            setCrearBloqueSuccess("");
          }}
        >
          <span className="admin_boton_icono_left">
            <span className="admin_colores_leyenda_span admin_disponible" />
          </span>
          CREAR PISTA LIBRE
        </button>

        <button
          className="admin_seccion_funciones_boton"
          onClick={() => {
            setRecPistas([]);
            setRecDias([]);
            setRecFechaInicio("");
            setRecFechaFin("");
            setRecFranjas(Array(9).fill(""));
            setRecError("");
            setRecSuccess("");
            setShowOverlayRecurrente(true);
          }}
        >
          <span className="admin_boton_icono_left">
            <span className="admin_colores_leyenda_span admin_disponible" /> 🔁
          </span>
          CREAR PISTA LIBRE - RECURRENTE
        </button>

        <button
          className="admin_seccion_funciones_boton"
          onClick={() => {
            setElimRecPistas([]);
            setElimRecDias([]);
            setElimRecFechaInicio("");
            setElimRecFechaFin("");
            setElimRecFranjas(Array(9).fill(""));
            setElimRecError("");
            setElimRecSuccess("");
            setShowOverlayEliminarRec(true);
          }}
        >
          <span className="admin_boton_icono_left">
            <span className="admin_colores_leyenda_span admin_disponible" /> 🔁{" "}
            <span className="admin_icono_x">✕</span>
          </span>
          ELIMINAR PISTA LIBRE - RECURRENTE
        </button>

        <button
          className="admin_seccion_funciones_boton"
          onClick={() => {
            setClaseRecPista("");
            setClaseRecDias([]);
            setClaseRecFechaInicio("");
            setClaseRecFechaFin("");
            setClaseRecFranjas(Array(9).fill(""));
            setClaseRecMonitor("");
            setClaseRecError("");
            setClaseRecSuccess("");
            setShowOverlayCrearClaseRec(true);
          }}
        >
          <span className="admin_boton_icono_left">
            <span className="admin_colores_leyenda_span admin_clase" />
          </span>
          RESERVAR PISTA CLASE - RECURRENTE
        </button>

        <button
          className="admin_seccion_funciones_boton"
          onClick={() => {
            setElimClaseRecPista("");
            setElimClaseRecMonitor("");
            setElimClaseRecDias([]);
            setElimClaseRecFechaInicio("");
            setElimClaseRecFechaFin("");
            setElimClaseRecFranjas(Array(9).fill(""));
            setElimClaseRecError("");
            setElimClaseRecSuccess("");
            setShowOverlayEliminarClaseRec(true);
          }}
        >
          <span className="admin_boton_icono_left">
            <span className="admin_colores_leyenda_span admin_clase" />{" "}
            <span className="admin_icono_x">✕</span>
          </span>
          ELIMINAR PISTA CLASE - RECURRENTE
        </button>

        <button
          className="admin_seccion_funciones_boton"
          onClick={() => {
            setTorneoError("");
            setTorneoSuccess("");
            setTorneoFechaInicio("");
            setTorneoHoraInicio("");
            setTorneoFechaFin("");
            setTorneoHoraFin("");
            setShowOverlayTorneo(true);
          }}
        >
          <span className="admin_boton_icono_left">
            <span className="admin_colores_leyenda_span admin_torneo" />
          </span>
          BLOQUEAR FIN DE SEMANA TORNEO
        </button>

        <button
          className="admin_seccion_funciones_boton"
          onClick={() => {
            setFijaError("");
            setFijaSuccess("");
            setFijaAvisos([]);
            setFijaFechaInicio("");
            setFijaFechaFin("");
            setFijaPista("");
            setFijaFranja("");
            setFijaUsuario(null);
            setFijaBusqueda("");
            setShowOverlayPistaFija(true);
            setFijaDiaSemana("");
          }}
        >
          <span className="admin_boton_icono_left">
            <span className="admin_colores_leyenda_span admin_ocupada" />{" "}
            🔁{" "}
          </span>
          ASIGNAR PISTA FIJA
        </button>
      </section>
    </>
  );
}

export default AdminPista;
