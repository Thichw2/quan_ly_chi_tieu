import { useExpenseContext } from '@/contexts';
interface Member {
  id: string;
  name: string;
  budget: number;
}
export function useMembers() {
    const { state, dispatch } = useExpenseContext();
  
    const addMember = (member: Member) => {
      dispatch({ type: 'ADD_MEMBER', payload: { ...member, id: crypto.randomUUID() } });
    };
  
    const updateMember = (member: Member) => {
      dispatch({ type: 'UPDATE_MEMBER', payload: member });
    };
  
    const deleteMember = (id: string) => {
      dispatch({ type: 'DELETE_MEMBER', payload: id });
    };
  
    return {
      members: state.members,
      addMember,
      updateMember,
      deleteMember,
    };
  }