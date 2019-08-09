import TaggersModule from '../../vuexModules/TaggersModule'

export default class FfaTaggerModule {
  public static addTags(taggersModule: TaggersModule, taggerKey: string, tagInputContent: string) {
    tagInputContent.split(/\s*(,|\s)\s*/).forEach((tag) => {
      const trimmed = tag.replace(/,/, '').trim()
      taggersModule.addTag(`${taggerKey}:${trimmed}`)
    })
  }
}
