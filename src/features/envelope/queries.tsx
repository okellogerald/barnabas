import { useMutation, useQuery } from "@tanstack/react-query";
import { Query, queryClient, QueryKeys } from "@/lib/query";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { Envelope, EnvelopeHistory } from "@/models";
import { EnvelopeBlockDTO, EnvelopeQueryParams } from "@/data/envelope";
import { EnvelopeManager } from "@/managers/envelope";

// Create a manager instance
const envelopeManager = EnvelopeManager.instance;

/**
 * Envelope query hooks for data fetching and mutations
 */
export const EnvelopeQueries = {
  /**
   * Hook to fetch a list of envelopes with optional filtering and pagination
   */
  useList: (params?: EnvelopeQueryParams): UseQueryResult<{ envelopes: Envelope[], total: number }, Error> =>
    useQuery({
      queryKey: [QueryKeys.Envelopes.list(), params],
      queryFn: async () => {
        const _params: EnvelopeQueryParams = {
          ...params,
          rangeStart: params?.rangeStart || 0,
          rangeEnd: params?.rangeEnd || 9,
        };

        return await envelopeManager.getEnvelopes(_params);
      },
    }),

  /**
   * Hook to get the total count of envelopes with optional filters
   */
  useCount: (filters?: Partial<EnvelopeQueryParams>): UseQueryResult<number, Error> =>
    useQuery({
      queryKey: [QueryKeys.Envelopes.count(), filters],
      queryFn: async () => {
        return envelopeManager.getEnvelopesCount(filters);
      },
    }),

  /**
   * Hook to fetch available envelopes
   */
  useAvailable: (): UseQueryResult<Envelope[], Error> =>
    useQuery({
      queryKey: QueryKeys.Envelopes.available(),
      queryFn: async () => {
        return await envelopeManager.getAvailableEnvelopes();
      },
    }),

  /**
   * Hook to fetch a single envelope by ID
   */
  useDetail: (id: string): UseQueryResult<Envelope, Error> =>
    useQuery({
      queryKey: QueryKeys.Envelopes.detail(id),
      queryFn: async () => {
        const envelope = await envelopeManager.getEnvelopeById(id);
        if (!envelope) {
          throw new Error(`Envelope with ID ${id} not found`);
        }
        return envelope;
      },
      enabled: !!id,
    }),

  /**
   * Hook to fetch a single envelope by number
   */
  useByNumber: (number: number): UseQueryResult<Envelope, Error> =>
    useQuery({
      queryKey: QueryKeys.Envelopes.byNumber(number),
      queryFn: async () => {
        const envelope = await envelopeManager.getEnvelopeByNumber(number);
        if (!envelope) {
          throw new Error(`Envelope with number ${number} not found`);
        }
        return envelope;
      },
      enabled: !!number,
    }),

  /**
   * Hook to fetch the history of an envelope
   */
  useHistory: (envelopeId: string): UseQueryResult<EnvelopeHistory[], Error> =>
    useQuery({
      queryKey: QueryKeys.Envelopes.history(envelopeId),
      queryFn: async () => {
        return await envelopeManager.getEnvelopeHistory(envelopeId);
      },
      enabled: !!envelopeId,
    }),

  /**
   * Hook for creating a block of envelopes
   */
  useCreateBlock: (): UseMutationResult<
    { count: number, startNumber: number, endNumber: number },
    Error,
    EnvelopeBlockDTO,
    unknown
  > =>
    useMutation({
      mutationFn: async (data: EnvelopeBlockDTO) => {
        return await envelopeManager.createEnvelopeBlock(data);
      },
      onSuccess: () => {
        // Invalidate relevant queries
        Query.Envelopes.invalidateList();
        Query.Envelopes.invalidateCount();
        Query.Envelopes.invalidateAvailable();
      },
    }),

  /**
   * Hook for deleting a block of envelopes
   */
  useDeleteBlock: (): UseMutationResult<
    { count: number, startNumber: number, endNumber: number },
    Error,
    EnvelopeBlockDTO,
    unknown
  > =>
    useMutation({
      mutationFn: async (data: EnvelopeBlockDTO) => {
        return await envelopeManager.deleteEnvelopeBlock(data);
      },
      onSuccess: () => {
        // Invalidate relevant queries
        Query.Envelopes.invalidateList();
        Query.Envelopes.invalidateCount();
        Query.Envelopes.invalidateAvailable();
      },
    }),

  /**
   * Hook for assigning an envelope to a member
   */
  useAssign: (): UseMutationResult<
    Envelope,
    Error,
    { envelopeId: string, memberId: string },
    unknown
  > =>
    useMutation({
      mutationFn: async ({ envelopeId, memberId }: { envelopeId: string, memberId: string }) => {
        return await envelopeManager.assignEnvelope(envelopeId, memberId);
      },
      onSuccess: (updatedEnvelope) => {
        // Update cache for the envelope
        queryClient.setQueryData(
          QueryKeys.Envelopes.detail(updatedEnvelope.id),
          updatedEnvelope
        );

        // Invalidate lists and history
        Query.Envelopes.invalidateList();
        Query.Envelopes.invalidateAvailable();
        Query.Envelopes.invalidateHistory(updatedEnvelope.id);
        
        // Also invalidate member queries if we have that memberId
        if (updatedEnvelope.memberId) {
          Query.Members.invalidateDetail(updatedEnvelope.memberId);
        }
      },
    }),

  /**
   * Hook for releasing an envelope from a member
   */
  useRelease: (): UseMutationResult<
    Envelope,
    Error,
    string,
    unknown
  > =>
    useMutation({
      mutationFn: async (envelopeId: string) => {
        return await envelopeManager.releaseEnvelope(envelopeId);
      },
      onSuccess: (updatedEnvelope, envelopeId) => {
        // Update cache for the envelope
        queryClient.setQueryData(
          QueryKeys.Envelopes.detail(envelopeId),
          updatedEnvelope
        );

        // Invalidate lists and history
        Query.Envelopes.invalidateList();
        Query.Envelopes.invalidateAvailable();
        Query.Envelopes.invalidateHistory(envelopeId);
      },
    }),
}