import {Octokit} from '@octokit/rest'
import * as xlsx from 'xlsx'

// import { graphql } from "@octokit/graphql"; //import to call graphql api

async function run(): Promise<void> {
  try {
    // get advance security billing api from github
    
    let dsp_org = ''
    if(process.env.GITHUB_ORG)
    {
      //set dsp_org from enviornment variable
      dsp_org = process.env.GITHUB_ORG
    }
    else{
      throw new Error("plese set GITHUB_ORG environment variable")
    }
    

    const token = process.env.INPUT_TOKEN
    const octokit = new Octokit({
      auth: token
    })
    // get all repos for an org using pagination
    let repocount = 0
    const repos = await octokit.paginate(
      octokit.repos.listForOrg,
      {org: dsp_org, type: 'all'},
      response => {
        repocount += response.data.length
        return response.data
      }
    )

    const promises = []
    const org_issues: string[][] = []
    const job_errors: string[][] = []
    job_errors.push(['error_type', 'repo', 'error_message'])
    org_issues.push(['org', 'repo', 'tool_name', 'tool_version', 
    'alert_number', 'alert_url', 'alert_state', 'rule_id', 
    'cwe', 'security_severity', 'path', 'start_line', 'end_line', 
    'created_at', 'updated_at', 'fixed_at', 'dismissed_at', 'dismissed_by'])

    console.log(`${dsp_org} has ${repocount} repos`)
    for (const repo of repos) {
      //console.log(`${repo.full_name}`)
      const login = repo.full_name.split('/')[0]
      const reponame = repo.full_name.split('/')[1]
      promises.push(
        await getRepoAlerts(octokit, login, reponame, org_issues, job_errors)
      )
    }

    await Promise.allSettled(promises)
    const wb = xlsx.utils.book_new()
    const ws = xlsx.utils.aoa_to_sheet(org_issues)
    const ws2 = xlsx.utils.aoa_to_sheet(job_errors)
    xlsx.utils.book_append_sheet(wb, ws, 'code-scanning-alerts')
    xlsx.utils.book_append_sheet(wb, ws2, 'errors')
    xlsx.writeFile(wb, `${dsp_org}-security-alerts.xlsx`)
  } catch (error) {
    console.error(error)
  }
}

run()

async function getRepoAlerts(
  octokit: Octokit,
  login: string,
  reponame: string,
  org_issues: string[][],
  job_errors: string[][]
): Promise<void> {
  let error_flag = 'successfully processed'
  let error_message = ''
  try {
    const alerts = await octokit.paginate(
      octokit.rest.codeScanning.listAlertsForRepo,
      {
        owner: login,
        repo: reponame
      }
    )
    if (alerts.length > 0) {
      for (const alert of alerts) {
        const rule: any = alert.rule
        let securitySeverity = ''
        let securityCwe = ''
        if (rule.security_severity_level) {
          securitySeverity = rule.security_severity_level
        } else {
          securitySeverity = rule.severity
        }
        for (const cwe of rule.tags) {
          if (cwe.includes('external/cwe/cwe')) {
            securityCwe = `${securityCwe}${cwe}, `
          }
        }
        securityCwe = securityCwe.replace(/,\s*$/, '')
        const _alert: any = alert
        const row: string[] = [
          login,
          reponame,
          alert.tool.name!,
          alert.tool.version!,
          alert.number.toString(),
          alert.html_url,
          alert.state,
          rule.id,
          securityCwe,
          securitySeverity,
          alert.most_recent_instance.location!.path,
          alert.most_recent_instance.location!.start_line,
          alert.most_recent_instance.location!.end_line,
          alert.created_at,
          _alert.updated_at,
          _alert.fixed_at,
          alert.dismissed_at,
          alert.dismissed_by
        ]
        org_issues.push(row)
      }
    }
  } catch (error) {
    error_flag = 'processing Failed for'
    error_message = 'unknown error'
    if (error instanceof Error) {
      error_message = error.message
    }
    job_errors.push(['code-scanning-alerts',`${login}/${reponame}`, error_message])
  } finally {
    console.log(`${error_flag} ${login}/${reponame}`)
  }
}
