import LocalStorageModule from '../../../../src/functionModules/localStorage/LocalStorageModule'
import DatatrustTask from '../../../../src/models/DatatrustTask'
import DatatrustTaskDetails, { DatatrustTaskStatus } from '../../../../src/models/DatatrustTaskDetails'

describe('LocalStorageModule.ts', () => {

  beforeEach(() => {
    localStorage.clear()
    jest.resetAllMocks()
  })

  it('returns null for nonexistant key', () => {
    expect(LocalStorageModule.read('dne')).toBeNull()
  })

  it('stringifies storeables for save', async () => {
    const details = new DatatrustTaskDetails()
    const task = new DatatrustTask('key', details)
    LocalStorageModule.store(task)
    expect(localStorage.setItem).toBeCalledWith('key', JSON.stringify(details))
  })

  it('returns storeable for key', () => {
    const details = new DatatrustTaskDetails()
    const task = new DatatrustTask('key', details);
    (localStorage.getItem as jest.Mock).mockImplementation((key: string, value: any) => {
      return JSON.stringify(details)
    })
    expect(LocalStorageModule.read('key')).not.toBeNull()
    const task2 = LocalStorageModule.read('key') as DatatrustTask
    expect(task2.key).toEqual('key')
    expect(task2.payload.created).toEqual(details.created)
    expect(task2.payload.resolved).toEqual(details.resolved)
    expect(task2.payload.status).toEqual(details.status)
    expect(localStorage.getItem).toBeCalledWith('key')
  })

  it ('deletes stuff', () => {
    LocalStorageModule.delete('key')
    expect(localStorage.removeItem).toBeCalledWith('key')
  })
})
