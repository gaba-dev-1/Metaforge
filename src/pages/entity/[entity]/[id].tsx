import { useRouter } from 'next/router';
import { Layout, Card, LoadingState, ErrorMessage } from '@/components/ui';
import { useEntityData, useTftData } from '@/utils/useTftData';
import unitsJson from 'public/mapping/units.json';
import traitsJson from 'public/mapping/traits.json';
import itemsJson from 'public/mapping/items.json';
import { UnitDetail, TraitDetail, ItemDetail, CompDetail } from '@/components/entity';
import { ProcessedUnit, ProcessedTrait, ProcessedItem, Composition } from '@/types';

export default function EntityDetailPage() {
  const router = useRouter();
  const { id, entity } = router.query;
  const entityType = entity as string;
  const entityId = id as string;
  
  // Fixed TypeScript error by using type assertion and accessing properties safely
  const tftData = useTftData() as any;
  const isLoading = tftData?.isLoading || false;
  const error = tftData?.error || null;
  const handleRetry = tftData?.handleRetry || (() => {});
  
  // Get entity data from the hook with explicit type
  const entityData = useEntityData(entityType, entityId);
  
  // Get specific details from json files
  const unitDetails = entityType === 'units' && entityId 
    ? (unitsJson.units as Record<string, any>)[entityId] 
    : null;
  
  const traitType = entityId && Object.keys(traitsJson.origins).includes(entityId) 
    ? 'origins' 
    : 'classes';
  
  const traitDetails = entityType === 'traits' && entityId 
    ? (traitsJson[traitType] as Record<string, any>)[entityId] 
    : null;
  
  const itemDetails = entityType === 'items' && entityId 
    ? (itemsJson.items as Record<string, any>)[entityId] 
    : null;
  
  // Loading state
  if (isLoading || !entityId) {
    return (
      <Layout>
        <LoadingState message="Loading entity data..." />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="mt-6">
          <ErrorMessage 
            message={error && typeof error === 'object' && 'message' in error ? String(error.message) : 'An error occurred'} 
            onRetry={handleRetry} 
          />
        </div>
      </Layout>
    );
  }

  // Entity not found
  if (!entityData && entityId) {
    return (
      <Layout>
        <Card className="mt-10">
          <div className="text-center py-8">
            <h1 className="text-xl text-gold mb-4">Entity Not Found</h1>
            <p className="text-center py-8">
              The {entityType?.slice(0, -1) || 'entity'} you're looking for doesn't exist or isn't available.
            </p>
            <button 
              onClick={() => router.back()}
              className="mt-6 bg-brown-light/50 hover:bg-brown-light/70 text-cream px-4 py-2 rounded-md"
            >
              Go Back
            </button>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="mt-10">
        {entityType === 'units' && entityData && (
          <UnitDetail 
            entityData={entityData as ProcessedUnit} 
            unitDetails={unitDetails} 
          />
        )}
        {entityType === 'traits' && entityData && (
          <TraitDetail 
            entityData={entityData as ProcessedTrait} 
            traitDetails={traitDetails} 
            traitType={traitType} 
            entityId={entityId} 
          />
        )}
        {entityType === 'items' && entityData && (
          <ItemDetail 
            entityData={entityData as ProcessedItem} 
            itemDetails={itemDetails} 
          />
        )}
        {entityType === 'comps' && entityData && (
          <CompDetail entityData={entityData as Composition} />
        )}
      </Card>
    </Layout>
  );
}
