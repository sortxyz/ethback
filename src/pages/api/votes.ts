import { sortWhitelistedContract } from '../../utils'
import got from 'got'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { SortResponse, VotesApiResponse } from '../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VotesApiResponse>
) {
  const { address: _address, start_block, end_block, type } = req.query
  const address = _address!.toString()

  const sortQuery = `
  select
    t.from_address as "from",
    CAST((t.gas_limit * t.gas_price) / 1e18 as FLOAT) as gas
  from
    ethereum.transaction t,
    ethereum.block b
  where
    t.block_id = b.id
    and t.to_address = '${address}'
    and t.function like '${type}'
    and b.block_number > ${start_block}
    and b.block_number < ${end_block}
  order by
    b.timestamp desc
  LIMIT
    100
  `

  let rows = [] as any;
  let meta = {} as any;

  // Loop though 10 pages of 100 records each
  for (let i=0; i<10; i++) {
    const data: SortResponse = await got
    .post('https://api.sort.xyz/v1/queries/run', {
      headers: {
        'x-api-key': process.env.SORT_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      json: { 
        query : sortQuery + ` OFFSET ${i*100}`,
      },
    })
    .json()

    rows = rows.concat(data.data.records);
    meta = data.data
  }

  res.status(200).json({ rows, meta })
}
