'use client';

import React, { useState, useEffect } from 'react';
import { Card, Avatar, Tag, Typography, Button, Space, Input, Spin, App as AntdApp } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { 
  NotificationOutlined, 
  CalendarOutlined, 
  ToolOutlined, 
  LikeOutlined, 
  CommentOutlined,
  ShareAltOutlined,
  SendOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Publicacion {
  idPublicacion: number;
  titulo: string;
  contenido: string;
  imagen_url: string | null;
  fecha_creacion: string;
  tipo_categoria: string;
  idUsuario: number;
  autor: string;
}

const getCategoryColor = (category: string) => {
  const normalizedCategory = category?.toLowerCase() || '';
  if (normalizedCategory.includes('urgente') || normalizedCategory.includes('mantenimiento')) return 'orange';
  if (normalizedCategory.includes('evento')) return 'green';
  return 'blue';
};

const getCategoryIcon = (category: string) => {
  const normalizedCategory = category?.toLowerCase() || '';
  if (normalizedCategory.includes('urgente') || normalizedCategory.includes('mantenimiento')) return <ToolOutlined />;
  if (normalizedCategory.includes('evento')) return <CalendarOutlined />;
  return <NotificationOutlined />;
};

export default function Home() {
  const { user } = useAuth();
  const { message } = AntdApp.useApp();
  const isAdmin = user?.rol?.toLowerCase() === 'administrador';
  const [posts, setPosts] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('Comunicado');
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/muro/');
      const data = await response.json();
      if (data && data.body) {
        setPosts(data.body);
      }
    } catch (error) {
      console.error("Error al obtener las publicaciones:", error);
      message.error("No se pudieron cargar las publicaciones del muro.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!titulo.trim() || !contenido.trim()) {
      message.warning('Por favor ingresa un título y un contenido.');
      return;
    }
    
    setSubmitting(true);
    
    const payload = {
      titulo,
      contenido,
      idUsuario: user?.cedula ? Number(user.cedula) : 999999999,
      tipo_categoria: categoria
    };

    try {
      const response = await fetch('http://localhost:3001/api/muro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        message.success('Publicación creada exitosamente.');
        setTitulo('');
        setContenido('');
        fetchPosts();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Backend Error Response:", errorData);
        message.error(`Error: ${errorData?.mensaje || errorData?.message || 'Hubo un error al crear la publicación.'}`);
      }
    } catch (error) {
      console.error('Error enviando publicación', error);
      message.error('No se pudo conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <Title level={2} className="!text-slate-800 !mb-1">Muro Social</Title>
        <Text type="secondary" className="text-lg">Mantente informado sobre lo que sucede en tu conjunto.</Text>
      </div>

      {isAdmin && (
        <Card className="mb-8 shadow-sm border-slate-200 rounded-xl overflow-hidden">
          <div className="flex gap-4">
            <Avatar size="large" className="bg-blue-900 flex-shrink-0">AD</Avatar>
            <div className="flex-grow">
              <Input 
                placeholder="Título de la publicación" 
                className="mb-3 rounded-lg"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <TextArea 
                rows={3} 
                placeholder="¿Qué información deseas compartir con la comunidad?" 
                className="mb-3 rounded-lg resize-none"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
              />
              <div className="flex justify-between items-center flex-wrap gap-3">
                <Space wrap>
                  <Button 
                    icon={<NotificationOutlined />} 
                    type={categoria === 'Comunicado' ? 'primary' : 'dashed'}
                    className={categoria === 'Comunicado' ? 'bg-blue-600' : ''}
                    onClick={() => setCategoria('Comunicado')}
                  >
                    Comunicado
                  </Button>
                  <Button 
                    icon={<CalendarOutlined />} 
                    type={categoria === 'Evento' ? 'primary' : 'dashed'}
                    className={categoria === 'Evento' ? 'bg-green-600 hover:!bg-green-500 border-none' : ''}
                    onClick={() => setCategoria('Evento')}
                  >
                    Evento
                  </Button>
                  <Button 
                    icon={<ToolOutlined />} 
                    type={categoria === 'Urgente' ? 'primary' : 'dashed'}
                    className={categoria === 'Urgente' ? 'bg-orange-600 hover:!bg-orange-500 border-none' : ''}
                    onClick={() => setCategoria('Urgente')}
                  >
                    Urgente
                  </Button>
                </Space>
                <Button 
                  type="primary" 
                  className="bg-blue-900" 
                  icon={<SendOutlined />}
                  onClick={handlePost}
                  loading={submitting}
                >
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <Text type="secondary">No hay publicaciones disponibles en este momento.</Text>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Card 
              key={post.idPublicacion} 
              className="shadow-sm hover:shadow-md transition-shadow border-slate-200 rounded-xl"
              actions={[
                <Button key="like" type="text" icon={<LikeOutlined />}> Me gusta</Button>,
                <Button key="comment" type="text" icon={<CommentOutlined />}> Comentarios</Button>,
                <Button key="share" type="text" icon={<ShareAltOutlined />}> Compartir</Button>,
              ]}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <Avatar className="bg-slate-300 text-slate-700 font-bold mt-1">
                    {post.autor ? post.autor.substring(0, 2).toUpperCase() : 'AD'}
                  </Avatar>
                  <div>
                    <Title level={5} className="!mb-0 !text-slate-800 capitalize">{post.autor}</Title>
                    <Text type="secondary" className="text-sm">{formatDate(post.fecha_creacion)}</Text>
                  </div>
                </div>
                <Tag 
                  color={getCategoryColor(post.tipo_categoria)} 
                  icon={getCategoryIcon(post.tipo_categoria)} 
                  className="rounded-full px-3 py-1 border-none font-medium"
                >
                  {post.tipo_categoria}
                </Tag>
              </div>
              
              <Title level={4} className="!text-slate-800 !mt-2">{post.titulo}</Title>
              <Paragraph className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                {post.contenido}
              </Paragraph>
              {post.imagen_url && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <img src={post.imagen_url} alt="Imagen adjunta" className="w-full h-auto object-cover max-h-96" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
