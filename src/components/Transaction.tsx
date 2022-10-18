import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi'

import { TransactionProps } from '../types'
import disperseAbi from '../contracts/disperse-abi.json'
import { Button } from '@ensdomains/thorin'

export default function Transaction({ addresses, values }: TransactionProps) {
  const { isConnected } = useAccount()

  const formattedValues = values.map((value) =>
    Math.floor(value / 0.000000000000000001)
  )

  const { config } = usePrepareContractWrite({
    addressOrName: '0xD152f549545093347A162Dce210e7293f1452150',
    contractInterface: disperseAbi,
    functionName: 'disperseEther',
    args: [addresses, formattedValues],
    overrides: {
      value: formattedValues.reduce((a, b) => a + b, 0).toString(),
    },
    onError: (err) => {
      const msg = err.message.includes('insufficient funds')
        ? 'Insufficient funds'
        : 'Error preparing transaction, try a smaller block range'
      alert(msg)
    },
  })

  const { write } = useContractWrite(config)

  if (isConnected) {
    return (
      <Button
        size="small"
        onClick={() => write?.()}
        style={{ maxWidth: '16rem' }}
      >
        Submit transaction
      </Button>
    )
  } else {
    return <ConnectButton showBalance={false} />
  }
}
