/**
 * Syndication Management Service
 *
 * Multi-party loan syndication orchestration with DAML integration including
 * syndicate formation, participant coordination, voting mechanisms, distributed
 * payment processing, and governance workflows for large-scale institutional lending.
 */

import { DamlService, DamlResponse, DamlContract } from "./daml";
import { getTemplateId, DAML_CONFIG } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";

export interface SyndicateParticipant {
  lender: string;
  lenderProfile: LenderProfile;
  commitment: string;
  role: string;
  votingPower: string;
}

export interface LenderProfile {
  lenderId: string;
  name: string;
  creditRating: string;
  totalCapital: string;
  availableCapital: string;
  activeLoans: number;
  defaultRate: string;
}

export interface InterestRateStructure {
  baseRate: string;
  margin: string;
  rateType: string;
}

export interface RepaymentSchedule {
  frequency: string;
  numberOfPayments: number;
  paymentAmount: string;
  startDate: string;
}

export interface LoanCovenant {
  covenantType: string;
  description: string;
  threshold: string;
}

export interface SyndicatedLoanData {
  loanId: string;
  borrower: string;
  leadLender: string;
  participants: SyndicateParticipant[];
  totalCommitment: string;
  outstandingPrincipal: string;
  interestRateStructure: InterestRateStructure;
  repaymentSchedule: RepaymentSchedule;
  arrangementFee: string;
  arrangementFeeDistribution: Array<[string, string]>;
  collateralAssets: any[];
  covenants: LoanCovenant[];
  startDate: string;
  maturityDate: string;
  status: string;
  paymentHistory: SyndicatedPaymentRecord[];
  lastPaymentDate?: string;
}

export interface SyndicatedPaymentRecord {
  paymentDate: string;
  totalAmount: string;
  principalAmount: string;
  interestAmount: string;
  lenderDistribution: Array<[string, string, string]>;
  status: string;
}

export interface SyndicateDecisionVoteData {
  voteId: string;
  loanId: string;
  borrower: string;
  leadLender: string;
  participants: SyndicateParticipant[];
  totalCommitment: string;
  decisionType: string;
  description: string;
  proposedBy: string;
  votesFor: string[];
  votesAgainst: string[];
  requiredMajority: string;
  proposedAt: string;
  votingDeadline: string;
  status: string;
}

export interface SyndicateFormationData {
  formationId: string;
  borrower: string;
  leadArranger: string;
  rfqId: string;
  targetAmount: string;
  commitments: SyndicateCommitment[];
  totalCommitted: string;
  arrangementFee: string;
  formationDeadline: string;
  status: string;
}

export interface SyndicateCommitment {
  lender: string;
  lenderProfile: LenderProfile;
  commitmentAmount: string;
  role: string;
  committedAt: string;
}

export interface SyndicateReportData {
  reportId: string;
  loanId: string;
  leadLender: string;
  participants: string[];
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  totalPaymentsReceived: string;
  outstandingPrincipal: string;
  loanPerformance: string;
  covenantCompliance: Array<[string, boolean]>;
  generatedAt: string;
}

export class SyndicationService {
  private damlService: DamlService;

  constructor() {
    this.damlService = DamlService.getInstance();
  }

  async getSyndicatedLoans(
    authToken: string
  ): Promise<DamlResponse<DamlContract<SyndicatedLoanData>[]>> {
    ConsoleLogger.info("Fetching syndicated loans");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("SyndicatedLoan")],
      },
      authToken
    );
  }

  async getSyndicatedLoanById(
    loanId: string,
    authToken: string
  ): Promise<DamlResponse<DamlContract<SyndicatedLoanData> | null>> {
    ConsoleLogger.info(`Fetching syndicated loan: ${loanId}`);

    const result = await this.damlService.queryContracts<SyndicatedLoanData>(
      {
        templateIds: [getTemplateId("SyndicatedLoan")],
      },
      authToken
    );

    if (result.status === 200 && result.result) {
      const loan = result.result.find((c) => c.payload.loanId === loanId);
      return {
        ...result,
        result: loan || null,
      };
    }

    return result as any;
  }

  async makeSyndicatedPayment(
    contractId: string,
    paymentAmount: string,
    principalPortion: string,
    interestPortion: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Making syndicated payment: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicatedLoan"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicatedLoan.MakeSyndicatedPayment,
        argument: {
          paymentAmount,
          principalPortion,
          interestPortion,
        },
      },
      authToken
    );
  }

  async markSyndicatedDefault(
    contractId: string,
    defaultReason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Marking syndicated loan as default: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicatedLoan"),
        contractId,
        choice: "MarkSyndicatedDefault",
        argument: {
          defaultReason,
        },
      },
      authToken
    );
  }

  async proposeSyndicateDecision(
    contractId: string,
    proposer: string,
    decisionType: string,
    description: string,
    votingDeadline: string,
    requiredMajority: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Proposing syndicate decision: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicatedLoan"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicatedLoan.ProposeSyndicateDecision,
        argument: {
          proposer,
          decisionType,
          description,
          votingDeadline,
          requiredMajority,
        },
      },
      authToken
    );
  }

  async addSyndicateParticipant(
    contractId: string,
    newParticipant: SyndicateParticipant,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Adding syndicate participant: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicatedLoan"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicatedLoan.AddSyndicateParticipant,
        argument: {
          newParticipant,
        },
      },
      authToken
    );
  }

  async removeSyndicateParticipant(
    contractId: string,
    participantToRemove: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Removing syndicate participant: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicatedLoan"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicatedLoan.RemoveSyndicateParticipant,
        argument: {
          participantToRemove,
        },
      },
      authToken
    );
  }

  async distributeArrangementFees(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Distributing arrangement fees: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicatedLoan"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicatedLoan.DistributeArrangementFees,
        argument: {},
      },
      authToken
    );
  }

  async getSyndicateVotes(
    authToken: string
  ): Promise<DamlResponse<DamlContract<SyndicateDecisionVoteData>[]>> {
    ConsoleLogger.info("Fetching syndicate votes");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("SyndicateDecisionVote")],
      },
      authToken
    );
  }

  async voteFor(
    contractId: string,
    voter: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Voting for decision: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicateDecisionVote"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicateDecisionVote.VoteFor,
        argument: {
          voter,
        },
      },
      authToken
    );
  }

  async voteAgainst(
    contractId: string,
    voter: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Voting against decision: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicateDecisionVote"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicateDecisionVote.VoteAgainst,
        argument: {
          voter,
        },
      },
      authToken
    );
  }

  async finalizeVote(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Finalizing vote: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicateDecisionVote"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicateDecisionVote.FinalizeVote,
        argument: {},
      },
      authToken
    );
  }

  async getSyndicateFormations(
    authToken: string
  ): Promise<DamlResponse<DamlContract<SyndicateFormationData>[]>> {
    ConsoleLogger.info("Fetching syndicate formations");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("SyndicateFormation")],
      },
      authToken
    );
  }

  async createSyndicateFormation(
    formationData: SyndicateFormationData,
    authToken: string
  ): Promise<DamlResponse<DamlContract<SyndicateFormationData>>> {
    ConsoleLogger.info(
      `Creating syndicate formation: ${formationData.formationId}`
    );

    return this.damlService.createContract(
      {
        templateId: getTemplateId("SyndicateFormation"),
        payload: formationData,
      },
      authToken
    );
  }

  async commitToSyndicate(
    contractId: string,
    lender: string,
    profile: LenderProfile,
    commitmentAmount: string,
    role: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Committing to syndicate: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicateFormation"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicateFormation.CommitToSyndicate,
        argument: {
          lender,
          profile,
          commitmentAmount,
          role,
        },
      },
      authToken
    );
  }

  async finalizeSyndicate(
    contractId: string,
    interestRateStructure: InterestRateStructure,
    repaymentSchedule: RepaymentSchedule,
    collateralAssets: any[],
    covenants: LoanCovenant[],
    loanDuration: { microseconds: string },
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Finalizing syndicate: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicateFormation"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicateFormation.FinalizeSyndicate,
        argument: {
          interestRateStructure,
          repaymentSchedule,
          collateralAssets,
          covenants,
          loanDuration,
        },
      },
      authToken
    );
  }

  async cancelFormation(
    contractId: string,
    reason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Cancelling syndicate formation: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicateFormation"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicateFormation.CancelFormation,
        argument: {
          reason,
        },
      },
      authToken
    );
  }

  async getSyndicateReports(
    authToken: string
  ): Promise<DamlResponse<DamlContract<SyndicateReportData>[]>> {
    ConsoleLogger.info("Fetching syndicate reports");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("SyndicateReport")],
      },
      authToken
    );
  }

  async createSyndicateReport(
    reportData: SyndicateReportData,
    authToken: string
  ): Promise<DamlResponse<DamlContract<SyndicateReportData>>> {
    ConsoleLogger.info(`Creating syndicate report: ${reportData.reportId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("SyndicateReport"),
        payload: reportData,
      },
      authToken
    );
  }

  async acknowledgeReport(
    contractId: string,
    participant: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Acknowledging report: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SyndicateReport"),
        contractId,
        choice: DAML_CONFIG.choices.SyndicateReport.AcknowledgeReport,
        argument: {
          participant,
        },
      },
      authToken
    );
  }

  calculateVotingPower(
    totalCommitment: number,
    participantCommitment: number
  ): number {
    if (totalCommitment === 0) return 0;
    return participantCommitment / totalCommitment;
  }

  calculateLenderShare(
    totalCommitment: number,
    lenderCommitment: number,
    paymentAmount: number
  ): number {
    if (totalCommitment === 0) return 0;
    return (lenderCommitment / totalCommitment) * paymentAmount;
  }

  hasQuorum(votingPower: number, quorumThreshold: number): boolean {
    return votingPower >= quorumThreshold;
  }

  calculateFeeDistribution(
    totalFee: number,
    leadLenderShare: number,
    participants: SyndicateParticipant[],
    totalCommitment: number
  ): Array<[string, number]> {
    const leadFee = totalFee * leadLenderShare;
    const participantFees = participants.map((p) => {
      const commitment = parseFloat(p.commitment);
      const share = commitment / totalCommitment;
      const fee = totalFee * (1 - leadLenderShare) * share;
      return [p.lender, fee] as [string, number];
    });

    return participantFees;
  }
}
