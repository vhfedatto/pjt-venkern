import { useState, useEffect, useCallback } from 'react';
import { contactsApi, interactionsApi, documentsApi } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { mapApiContactToUi, mapApiInteractionToUi, mapApiDocumentToUi } from '../services/mappers';
import type { Contact, ContactInteraction, ContactDocument, InteractionType } from '../types';

export function useContactDetails(id: string) {
  const { currentProject } = useProject();
  const [contact, setContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<ContactInteraction[]>([]);
  const [documents, setDocuments] = useState<ContactDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [contactData, interactionData, documentData, contactsData] = await Promise.all([
        contactsApi.get(id),
        interactionsApi.list(id),
        documentsApi.list(id),
        currentProject ? contactsApi.list({ project_id: currentProject.id, per_page: 200 }) : Promise.resolve({ data: [] }),
      ]);
      setContact(mapApiContactToUi(contactData));
      setInteractions((interactionData as any[]).map(mapApiInteractionToUi));
      setDocuments((documentData as any[]).map(mapApiDocumentToUi));
      setContacts((contactsData.data ?? []).map(mapApiContactToUi));
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar contato');
    } finally {
      setLoading(false);
    }
  }, [currentProject, id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addInteraction = useCallback(
    async (type: InteractionType, description: string, createdBy?: string) => {
      const body: Record<string, unknown> = {
        contact_id: Number(id),
        type,
        description,
      };
      if (createdBy) body.created_by = Number(createdBy);
      const data = await interactionsApi.create(body);
      const newItem = mapApiInteractionToUi(data);
      setInteractions(prev => [newItem, ...prev]);
      return newItem;
    },
    [id],
  );

  const removeInteraction = useCallback(async (interactionId: string) => {
    await interactionsApi.remove(interactionId);
    setInteractions(prev => prev.filter(i => i.id !== interactionId));
  }, []);

  const uploadDocument = useCallback(
    async (file: File): Promise<ContactDocument> => {
      const data = await documentsApi.upload(id, file);
      const newDoc = mapApiDocumentToUi(data);
      setDocuments(prev => [newDoc, ...prev]);
      return newDoc;
    },
    [id],
  );

  const removeDocument = useCallback(async (documentId: string) => {
    await documentsApi.remove(documentId);
    setDocuments(prev => prev.filter(d => d.id !== documentId));
  }, []);

  return {
    contact,
    contacts,
    interactions,
    documents,
    loading,
    error,
    refetch: fetchAll,
    addInteraction,
    removeInteraction,
    uploadDocument,
    removeDocument,
  };
}
