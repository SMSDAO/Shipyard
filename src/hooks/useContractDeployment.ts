"use client";

import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

export const useContractDeployment = () => {
  const { data: hash, error, isPending, sendTransaction, sendTransactionAsync } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const executeDeploy = async (bytecode: `0x${string}`, initialValueEth: string = "0") => {
    try {
      const tx = await sendTransactionAsync({
        to: undefined, // Contract Creation transaction
        data: bytecode,
        value: parseEther(initialValueEth),
      });
      return tx;
    } catch (err) {
      console.error("Contract Deployment Failed:", err);
      throw err;
    }
  };

  return {
    executeDeploy,
    txHash: hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
