import {useCallback} from 'react'
import {ColorInput} from '@sanity/color-input'
import {unset, type ObjectInputProps} from 'sanity'
import {Button, Flex, Stack, Text} from '@sanity/ui'

export function ColorInputWithReset(props: ObjectInputProps) {
  const {onChange, value} = props

  const handleClear = useCallback(() => {
    onChange(unset())
  }, [onChange])

  return (
    <Stack space={3}>
      <ColorInput {...props} />
      {Boolean(value) && (
        <Flex gap={2} align="center">
          <Button
            mode="bleed"
            tone="critical"
            fontSize={1}
            padding={2}
            text="Reset to default"
            onClick={handleClear}
          />
        </Flex>
      )}
      <Text size={1} muted>
        Pick visually or type/paste any hex value (e.g. #1e1e24).
      </Text>
    </Stack>
  )
}
