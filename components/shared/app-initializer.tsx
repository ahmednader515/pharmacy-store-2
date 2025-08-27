import React, { useEffect, useState } from 'react'
import useSettingStore from '@/hooks/use-setting-store'
import data from '@/lib/data'

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode
}) {
  const [rendered, setRendered] = useState(false)
  const setting = data.settings[0];

  useEffect(() => {
    setRendered(true)
  }, [setting])

  if (!rendered) {
    useSettingStore.setState({
      setting,
    })
  }

  return children
}
