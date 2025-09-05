import React from 'react';
import { FiUser } from 'react-icons/fi';
import './styles.css';

export default function Comment({ comment }) {
  return (
    <div className="comment-container">
      <div className="comment-author-icon">
        <FiUser size={20} />
      </div>
      <div className="comment-content">
        <div className="comment-header">
          {/* CORREÇÃO: O backend envia 'author_name', e não 'user_name' */}
          <span className="comment-author-name">{comment.author_name}</span>
          <span className="comment-date">
            {new Date(comment.created_at).toLocaleString('pt-BR')}
          </span>
        </div>
        <p className="comment-text">{comment.content}</p>
      </div>
    </div>
  );
}