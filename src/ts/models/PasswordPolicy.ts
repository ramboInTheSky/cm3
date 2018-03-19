export class PasswordPolicy {
    _id: string
    name: string
    minLength ? : number
    maxLength: number
    minMatchingCharacterRules: number
    blacklistedDictionaryWords: string
    rejectPreviousPasswords: boolean
    maxCharacterRepeat: number
    rejectUsername: boolean
    rejectPalindromes: boolean
    minUsernameLevenshteinDistance: number
    minPreviousPasswordLevenshteinDistance: number
    rejectCommonPasswordsDictionary: boolean
    characterRules: {} //how does this look like?
    //how do I determine the default one?
}

export class PasswordPolicyList {
    passwordPolicies: Array < PasswordPolicy >
}