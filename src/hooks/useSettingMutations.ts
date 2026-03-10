import { saveSettings } from '@/services/settingsService'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

export const useSettingMutations = () => {
  const queryClient = useQueryClient()

  const onSuccess = (msg: string) => {
    queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    toast.success(msg)
  }

  const onError = (error: any) => {
    toast.error(error.message || 'Operation failed')
  }

  const updateMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => onSuccess('Settings updated successfully'),
    onError,
  })

  return {
    updateSettings: updateMutation.mutate,
    isSaving: updateMutation.isPending,
  }
}
