export interface Artist {
    _id: string;
    nombre: string;
    pais: string | null;
    descripcion: string | null;
    generos: string[];
    idioma: string | null;
    fecha: string;
  }
  
  export interface Album {
    _id: string;
    titulo: string;
    anio: number | null;
    id_artista: string;
    portada: { url: string; descripcion?: string } | null;
    idioma: string;
    fecha: string;
  }
  
  export interface Song {
    _id: string;
    titulo: string;
    letra: string;
    duracion: number;
    genero: string;
    nombre_artista: string;
    artista: {
      id_artista: string;
      nombre: string;
      pais?: string;
    };
    album: {
      id_album: string;
      titulo: string;
      anio?: number;
    };
    emociones: string[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Playlist {
    _id: string;
    titulo: string;
    descripcion: string | null;
    id_usuario: string;
    portada: { url: string; descripcion?: string } | null;
    canciones: PlaylistSong[];
    fecha_creacion: string;
  }
  
  export interface PlaylistSong {
    id_cancion: string;
    titulo: string;
    nombre_artista: string;
    duracion: number | null;
    portada_url: string | null;
  }
  
  export interface User {
    _id: string;
    nombre: string;
    correo: string;
    plan_suscripcion: 'free' | 'premium' | 'family';
    tiempo_escucha: number;
    portada: { url: string; descripcion?: string } | null;
    fecha_registro: string;
  }
  
  export interface Event {
    _id: string;
    id_usuario: string;
    cancion_snapshot: {
      id_cancion: string;
      titulo: string;
      nombre_artista: string;
      nombre_genero: string | null;
      duracion: number | null;
    };
    emocion: {
      nombre: string;
      descripcion: string | null;
    };
    tipo_relacion: 'favorita' | 'reproducida' | 'buscada';
    fecha_evento: string;
  }
  
  export interface Query {
    _id: string;
    id_usuario: string;
    texto_pregunta: string;
    fecha: string;
    modelo_embedding: string;
    resultados: QueryResult[];
    respuesta_llm: LLMResponse | null;
  }
  
  export interface QueryResult {
    id_cancion: string | null;
    titulo: string | null;
    nombre_artista: string | null;
    score_similitud: number | null;
  }
  
  export interface LLMResponse {
    texto: string;
    modelo_usado: string;
    fecha_generacion: string;
    chunks_usados: string[];
  }
  
  export interface SearchResult {
    albums: Album[];
    artists: Artist[];
  }
  
  // API State types for hooks
  
  export interface ApiState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
  }