import { MemberInfo } from "@/features/members/components/member-info";

interface MemberInfoPageProps {
  params: {
    workspaceId: string;
    memberId: string;
  };
}

const MemberInfoPage = ({ params }: MemberInfoPageProps) => {
  return (
    <div className="w-full lg:max-w-4xl mx-auto">
      <MemberInfo 
        memberId={params.memberId} 
        workspaceId={params.workspaceId} 
      />
    </div>
  );
};

export default MemberInfoPage;