import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Trash2, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
// Remover importação não utilizada

type MediaItem = {
  bucket: string;
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  created_at: string;
  metadata?: Record<string, any>;
};

const MediaManager = () => {
  const { t } = useLanguage();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      console.log('Buscando mídia de todos os buckets...');
      
      // Primeiro, garantir que o bucket 'media' exista
      try {
        await mediaAPI.ensureBucketExists('media');
      } catch (bucketError: any) {
        console.warn('Erro ao verificar bucket padrão:', bucketError);
        // Continuar mesmo com erro para tentar listar outros buckets
      }
      
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('Erro ao listar buckets:', bucketError);
        throw bucketError;
      }
      
      if (!buckets || buckets.length === 0) {
        console.log('Nenhum bucket encontrado');
        setMedia([]);
        return;
      }
      
      console.log(`Encontrados ${buckets.length} buckets: ${buckets.map(b => b.name).join(', ')}`);
      
      const allMedia = [];
      for (const bucket of buckets) {
        try {
          console.log(`Listando arquivos do bucket '${bucket.name}'...`);
          const { data, error } = await supabase.storage.from(bucket.name).list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
          });
          
          if (error) {
            console.error(`Erro ao listar arquivos do bucket '${bucket.name}':`, error);
            throw error;
          }
          
          if (!data || data.length === 0) {
            console.log(`Bucket '${bucket.name}' está vazio`);
            continue;
          }
          
          console.log(`Encontrados ${data.length} arquivos no bucket '${bucket.name}'`);
          
          const bucketMedia = data.map(item => {
            const url = supabase.storage.from(bucket.name).getPublicUrl(item.name).data.publicUrl;
            const type = item.metadata?.mimetype?.includes('image') ? 'image' : 'video' as 'image' | 'video';
            
            return {
              id: item.id,
              url,
              type,
              name: item.name,
              bucket: bucket.name,
              size: item.metadata?.size || 0,
              created_at: item.created_at,
              metadata: item.metadata
            };
          });
          
          allMedia.push(...bucketMedia);
        } catch (err) {
          console.error(`Erro ao processar bucket '${bucket.name}':`, err);
          continue; // Pular para o próximo bucket se o atual falhar
        }
      }

      console.log(`Total de ${allMedia.length} arquivos de mídia encontrados`);
      setMedia(allMedia);
    } catch (error: any) {
      console.error('Erro ao buscar mídia:', error);
      toast({
        title: t("Error", "Erro"),
        description: error.message || t("Failed to load media files", "Falha ao carregar arquivos de mídia"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Utility functions for media operations
  const mediaAPI = {
    ensureBucketExists: async (bucketName: string) => {
      try {
        console.log(`Verificando se o bucket '${bucketName}' existe...`);
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error('Erro ao listar buckets:', listError);
          // Verificar se é um erro de permissão
          if (listError.message?.includes('permission') || (typeof listError.code !== 'undefined' && listError.code === 'PGRST301')) {
            throw new Error(`Erro de permissão ao listar buckets. Verifique se o token do Supabase tem permissões adequadas: ${listError.message}`);
          }
          throw listError;
        }
        
        if (!buckets) {
          console.warn('Nenhum bucket retornado pela API do Supabase');
          throw new Error('Não foi possível obter a lista de buckets');
        }
        
        console.log(`Buckets encontrados: ${buckets.map(b => b.name).join(', ')}`);
        const bucketExists = buckets.some(b => b.name === bucketName);
        
        if (!bucketExists) {
          console.log(`Bucket '${bucketName}' não existe. Tentando criar...`);
          const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/*', 'video/*'],
            fileSizeLimit: 50 * 1024 * 1024 // 50MB
          });
          
          if (error) {
            console.error(`Erro ao criar bucket '${bucketName}':`, error);
            // Verificar tipos específicos de erro
            if (error.message?.includes('already exists')) {
              console.log(`Bucket '${bucketName}' já existe, mas não foi detectado na listagem.`);
              return true;
            } else if (error.message?.includes('permission') || (typeof error.code !== 'undefined' && error.code === 'PGRST301')) {
              throw new Error(`Erro de permissão ao criar bucket. Verifique se o token do Supabase tem permissões adequadas: ${error.message}`);
            }
            throw error;
          }
          console.log(`Bucket '${bucketName}' criado com sucesso!`, data);
        } else {
          console.log(`Bucket '${bucketName}' já existe.`);
        }
        return true;
      } catch (error: any) {
        console.error('Erro em ensureBucketExists:', error);
        throw error;
      }
    },
  
    create: async (file: File, bucket: string = 'media') => {
      try {
        console.log(`Iniciando upload de arquivo para o bucket '${bucket}'...`);
        await mediaAPI.ensureBucketExists(bucket);
        
        // Criar um nome de arquivo único com timestamp para evitar colisões
        const fileExt = file.name.split('.').pop();
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
        console.log(`Enviando arquivo '${fileName}' para o bucket '${bucket}'...`);
        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
        if (error) {
          console.error(`Erro ao fazer upload do arquivo para '${bucket}':`, error);
          if (error.message?.includes('permission') || (typeof error.code !== 'undefined' && error.code === 'PGRST301')) {
            throw new Error(`Erro de permissão ao fazer upload. Verifique as políticas de segurança do bucket: ${error.message}`);
          }
          throw error;
        }
        
        console.log(`Upload concluído com sucesso: ${fileName}`, data);
        return { data, error };
      } catch (error: any) {
        console.error('Erro em create:', error);
        throw error;
      }
    },
    
    read: async (bucket: string) => {
      await mediaAPI.ensureBucketExists(bucket);
      const { data, error } = await supabase.storage.from(bucket).list();
      return { data, error };
    },
    
    update: async (oldName: string, newName: string, bucket: string) => {
      await mediaAPI.ensureBucketExists(bucket);
      const { data, error } = await supabase.storage.from(bucket).move(oldName, newName);
      return { data, error };
    },
    
    delete: async (name: string, bucket: string) => {
      await mediaAPI.ensureBucketExists(bucket);
      const { data, error } = await supabase.storage.from(bucket).remove([name]);
      return { data, error };
    }
  };
  
  // Then modify your handlers to use these:
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      console.log(`Iniciando upload do arquivo: ${selectedFile.name} (${selectedFile.type}, ${selectedFile.size} bytes)`);
      
      // Verificar tipo de arquivo
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        throw new Error(t(
          "Only image and video files are allowed", 
          "Apenas arquivos de imagem e vídeo são permitidos"
        ));
      }
      
      // Verificar tamanho do arquivo (limite de 50MB)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > MAX_SIZE) {
        throw new Error(t(
          "File size exceeds the limit of 50MB", 
          "O tamanho do arquivo excede o limite de 50MB"
        ));
      }
      
      const { error } = await mediaAPI.create(selectedFile);
      if (error) throw error;
      
      toast({
        title: t("Success", "Sucesso"),
        description: t("File uploaded successfully", "Arquivo enviado com sucesso"),
      });
      
      setShowUploadDialog(false);
      setSelectedFile(null);
      fetchMedia();
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: t("Error", "Erro"),
        description: error.message || t("An unknown error occurred", "Ocorreu um erro desconhecido"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string, bucket: string) => {
    if (confirm(t("Are you sure you want to delete this file?", "Tem certeza que deseja excluir este arquivo?"))) {
      try {
        const { error } = await supabase
          .storage
          .from(bucket)
          .remove([name]);

        if (error) throw error;
        
        toast({
          title: t("Success", "Sucesso"),
          description: t("File deleted successfully", "Arquivo excluído com sucesso"),
        });
        
        fetchMedia();
      } catch (error: any) {
        toast({
          title: t("Error", "Erro"),
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdate = async (oldName: string, newName: string, bucket: string) => {
    // Prevent unnecessary updates if the name hasn't changed
    if (oldName === newName) return;

    try {
      console.log(`Tentando renomear '${oldName}' para '${newName}' no bucket '${bucket}'`);
      const { error } = await supabase
        .storage
        .from(bucket)
        .move(oldName, newName);
  
      if (error) throw error;
      
      toast({
        title: t("Success", "Sucesso"),
        description: t("File renamed successfully", "Arquivo renomeado com sucesso"),
      });
      
      fetchMedia();
    } catch (error: any) {
      toast({
        title: t("Error", "Erro"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Modify the TableRow to include update functionality
  {media.map((item) => (
    <TableRow key={item.id}>
      <TableCell>
        {item.type === 'image' ? 
          <img 
            src={item.url} 
            alt={item.name}
            className="h-20 w-20 object-cover rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '';
              target.className = 'h-10 w-10';
              target.parentElement!.innerHTML = '<Image className="h-10 w-10" />';
            }}
          /> : 
          <Video className="h-10 w-10" />}
      </TableCell>
      <TableCell>{item.bucket}</TableCell>
      <TableCell>
        <input 
          type="text" 
          defaultValue={item.name}
          onBlur={(e) => handleUpdate(item.id, e.target.value, item.bucket)} // Assuming handleUpdate uses item.id as oldName identifier, adjust if needed
          className="border rounded px-2 py-1 w-full"
        />
      </TableCell>
      <TableCell>{item.type}</TableCell>
      <TableCell>{(item.size / 1024).toFixed(2)} KB</TableCell>
      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
      <TableCell className="flex gap-2">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleDelete(item.id, item.name, item.bucket)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  ))}
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("Media Manager", "Gerenciador de Mídia")}</h2>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t("Upload", "Enviar")}
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Preview", "Pré-visualização")}</TableHead>
              <TableHead>{t("Bucket", "Bucket")}</TableHead>
              <TableHead>{t("Name", "Nome")}</TableHead>
              <TableHead>{t("Type", "Tipo")}</TableHead>
              <TableHead>{t("Size", "Tamanho")}</TableHead>
              <TableHead>{t("Date", "Data")}</TableHead>
              <TableHead>{t("Actions", "Ações")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {media.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.type === 'image' ? 
                    <img 
                      src={item.url} 
                      alt={item.name}
                      className="h-20 w-20 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                        target.className = 'h-10 w-10';
                        target.parentElement!.innerHTML = '<Image className="h-10 w-10" />';
                      }}
                    /> : 
                    <Video className="h-10 w-10" />}
                </TableCell>
                <TableCell>{item.bucket}</TableCell>
                <TableCell>
                  <input 
                    type="text" 
                    defaultValue={item.name}
                    onBlur={(e) => handleUpdate(item.name, e.target.value, item.bucket)}
                    className="border rounded px-2 py-1 w-full"
                  />
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{(item.size / 1024).toFixed(2)} KB</TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(item.id, item.name, item.bucket)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Upload Media", "Enviar Mídia")}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                {t("File", "Arquivo")}
              </Label>
              <input 
                id="file" 
                type="file" 
                className="col-span-3"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              {t("Upload", "Enviar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaManager;