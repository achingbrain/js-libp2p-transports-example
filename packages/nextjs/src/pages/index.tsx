import Head from 'next/head'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'
import Nav from '@/components/nav'
import { useLibp2pContext } from '@/context/ctx'
import { useCallback, useEffect, useState } from 'react'
import {
  connectToMultiaddrs,
  filterPublicMultiaddrs,
  getPeerMultiaddrs,
  Libp2pDialError,
} from '@/lib/libp2p'
import type { Multiaddr } from '@multiformats/multiaddr'
import { multiaddr } from '@multiformats/multiaddr'

const DEFAULT_APP_PEER = '12D3KooWBdmLJjhpgJ9KZgLM3f894ff9xyBfPvPjFNn7MKJpyrC2'
// const APP_PEER = '12D3KooWRBy97UB99e3J6hiPesre1MZeuNQvfan4gBziswrRJsNK'

export default function Home() {
  const { libp2p } = useLibp2pContext()
  const [isConnected, setIsConnected] = useState(false)
  const [peerID, setPeerID] = useState(DEFAULT_APP_PEER)
  const [multiaddrs, setMultiaddrs] = useState<Multiaddr[]>()

  // Effect hook to connect to a specific peer when the page loads
  // useEffect(() => {
  // const connect = async () => {
  //   await connectToMultiaddrs(libp2p)([
  //     multiaddr(
  //       '/dns4/ny5.bootstrap.libp2p.io/tcp/443/wss/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
  //     ),
  //   ])
  // }

  // connect()
  //   .then(() => {
  //     setIsConnected(true)
  //   })
  //   .catch((e) => {
  //     console.error(e, e?.error)
  //     setIsConnected(false)
  //   })
  // }, [setIsConnected, setMultiaddrs, libp2p])

  const handleGetMultiaddrs = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        // 👇 Peer routing (DHT/DELEGATED)
        setMultiaddrs(undefined)
        const addrs = await getPeerMultiaddrs(libp2p)(peerID)

        setMultiaddrs(addrs)
      } catch (e) {
        console.error(e)
      }
    },
    [libp2p, setMultiaddrs, peerID],
  )

  const handleFilterMultiaddrs = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (multiaddrs) {
        setMultiaddrs(filterPublicMultiaddrs(multiaddrs))
      }
    },
    [setMultiaddrs, multiaddrs],
  )

  const handleConnectToMultiaddrs = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        if (multiaddrs) {
          const connections = await connectToMultiaddrs(libp2p)(multiaddrs, peerID)
          console.log('connections: ', connections)
        }
      } catch (e) {
        console.error(e)
      }
    },
    [libp2p, multiaddrs],
  )

  const handlePeerIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPeerID(e.target.value)
    },
    [setPeerID],
  )

  const getMultiaddrs = useCallback(async () => {}, [])

  return (
    <>
      <Head>
        <title>js-libp2p-nextjs-example</title>
        <meta name="description" content="js-libp2p-nextjs-example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-full">
        <Nav />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Libp2p WebTransport Example
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ul className="my-2 space-y-2 break-all">
                <li className="">This PeerID: {libp2p.peerId.toString()}</li>
              </ul>

              <div className="my-6 w-1/2">
                <label
                  htmlFor="peer-id"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  PeerID to connect to
                </label>
                <div className="mt-2">
                  <input
                    value={peerID}
                    type="text"
                    name="peer-id"
                    id="peer-id"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="12D3Koo..."
                    aria-describedby="peer-id-description"
                    onChange={handlePeerIdChange}
                  />
                </div>
                {/* <p
                  className="mt-2 text-sm text-gray-500"
                  id="peer-id-description"
                ></p> */}
                <button
                  type="button"
                  className="rounded-md bg-indigo-600 my-2 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={handleGetMultiaddrs}
                >
                  Get Multiaddrs
                </button>
              </div>
              <div>
                {multiaddrs && multiaddrs.length > 0 ? (
                  <>
                    <h3> Multiaddrs for {peerID} 👇</h3>
                    <pre className="px-2">
                      {multiaddrs.map((peer) => peer.toString()).join('\n')}
                    </pre>
                    <button
                      type="button"
                      className="rounded-md bg-teal-500 mx-2 my-2 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={handleFilterMultiaddrs}
                    >
                      Filter Public WebTransport
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-teal-500 my-2 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={handleConnectToMultiaddrs}
                    >
                      Connect to Peer
                    </button>
                  </>
                ) : null}
              </div>
              <p className="my-4 inline-flex items-center text-xl">
                Connected:{' '}
                {isConnected ? (
                  <CheckCircleIcon className="inline w-6 h-6 text-green-500" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-500" />
                )}
              </p>
            </div>
          </main>
        </div>
      </main>
    </>
  )
}
