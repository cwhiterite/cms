import {useCallback, useEffect, useState} from 'react'
import {ColorInput} from '@sanity/color-input'
import {set, unset, type ObjectInputProps} from 'sanity'
import {Button, Card, Flex, Stack, Text} from '@sanity/ui'

export function ColorInputWithEyedropper(props: ObjectInputProps) {
  const {onChange, value} = props
  const [hasEyeDropper, setHasEyeDropper] = useState(false)

  useEffect(() => {
    setHasEyeDropper(typeof window !== 'undefined' && 'EyeDropper' in window)
  }, [])

  const handleEyeDropper = useCallback(async () => {
    if (!('EyeDropper' in window)) return
    try {
      const eyeDropper = new (window as any).EyeDropper()
      const result = await eyeDropper.open()
      if (result?.sRGBHex) {
        onChange(
          set({
            _type: 'color',
            hex: result.sRGBHex,
          }),
        )
      }
    } catch {
      // User cancelled eyedropper (Esc or clicked outside)
    }
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(unset())
  }, [onChange])

  return (
    <Stack space={3}>
      <ColorInput {...props} />
      <Flex gap={2} align="center">
        {hasEyeDropper && (
          <Button
            mode="ghost"
            tone="primary"
            fontSize={1}
            padding={2}
            text="Pick color from image"
            title="Click to sample any color directly from the image on your screen"
            onClick={handleEyeDropper}
          />
        )}
        {value && (
          <Button
            mode="bleed"
            tone="critical"
            fontSize={1}
            padding={2}
            text="Reset to default"
            onClick={handleClear}
          />
        )}
      </Flex>
      <Text size={1} muted>
        Pick visually, type/paste any hex value (e.g. #1e1e24), or sample directly from the image.
      </Text>
    </Stack>
  )
}
